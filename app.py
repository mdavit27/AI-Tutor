from flask import Flask, render_template, request, jsonify
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from Sastrawi.StopWordRemover.StopWordRemoverFactory import (
    StopWordRemoverFactory
)

from Sastrawi.Stemmer.StemmerFactory import (
    StemmerFactory
)


app = Flask(__name__)


# =====================================================
# 1. LOAD DATASET
# =====================================================

dataset = pd.read_csv("dataset.csv")

quiz_data = pd.read_csv("quiz.csv")


# =====================================================
# 2. NLP PREPROCESSING
# =====================================================

stopword_factory = StopWordRemoverFactory()

stopword_remover = stopword_factory.create_stop_word_remover()


stemmer_factory = StemmerFactory()

stemmer = stemmer_factory.create_stemmer()


def preprocess_text(text):

    text = str(text)

    # Case folding
    text = text.lower()

    # Menghapus stopword
    text = stopword_remover.remove(text)

    # Stemming bahasa Indonesia
    text = stemmer.stem(text)

    return text


# =====================================================
# 3. PREPROCESS DATASET
# =====================================================

dataset["processed_question"] = dataset["pertanyaan"].apply(
    preprocess_text
)


# =====================================================
# 4. TF-IDF
# =====================================================

vectorizer = TfidfVectorizer()

tfidf_matrix = vectorizer.fit_transform(
    dataset["processed_question"]
)


# =====================================================
# 5. FUNGSI AI TUTOR
# =====================================================

def find_answer(question):

    processed_question = preprocess_text(question)

    question_vector = vectorizer.transform(
        [processed_question]
    )

    similarity = cosine_similarity(
        question_vector,
        tfidf_matrix
    )

    similarity_scores = similarity[0]

    best_index = similarity_scores.argmax()

    best_score = similarity_scores[best_index]

    # Batas minimal kemiripan
    threshold = 0.20

    if best_score < threshold:

        return {
            "answer": (
                "Maaf, saya belum menemukan jawaban "
                "yang sesuai dengan pertanyaan tersebut. "
                "Coba gunakan kata kunci yang lebih spesifik."
            ),
            "category": "Tidak ditemukan",
            "score": best_score
        }

    answer = dataset.iloc[best_index]["jawaban"]

    category = dataset.iloc[best_index]["kategori"]

    return {
        "answer": answer,
        "category": category,
        "score": best_score
    }


# =====================================================
# 6. HALAMAN UTAMA
# =====================================================

@app.route("/")
def index():

    return render_template(
        "index.html"
    )


# =====================================================
# 7. HALAMAN AI TUTOR
# =====================================================

@app.route("/tutor")
def tutor():

    return render_template(
        "tutor.html"
    )


# =====================================================
# 8. API TANYA AI
# =====================================================

@app.route("/ask", methods=["POST"])
def ask():

    data = request.get_json()

    question = data.get(
        "question",
        ""
    )

    if not question.strip():

        return jsonify({
            "success": False,
            "message": "Pertanyaan tidak boleh kosong."
        })


    result = find_answer(question)


    return jsonify({
        "success": True,
        "answer": result["answer"],
        "category": result["category"],
        "score": round(
            result["score"] * 100,
            2
        )
    })


# =====================================================
# 9. JELASKAN MATERI
# =====================================================

@app.route("/explain", methods=["POST"])
def explain():

    data = request.get_json()

    material = data.get(
        "material",
        ""
    )

    if not material.strip():

        return jsonify({
            "success": False,
            "message": "Materi tidak boleh kosong."
        })


    result = find_answer(material)


    return jsonify({
        "success": True,
        "answer": result["answer"],
        "category": result["category"],
        "score": round(
            result["score"] * 100,
            2
        )
    })


# =====================================================
# 10. GENERATE QUIZ
# =====================================================

@app.route("/generate-quiz", methods=["POST"])
def generate_quiz():

    data = request.get_json()

    category = data.get(
        "category",
        "Semua"
    )

    jumlah = int(
        data.get(
            "jumlah",
            5
        )
    )


    if category == "Semua":

        available_questions = quiz_data

    else:

        available_questions = quiz_data[
            quiz_data["kategori"] == category
        ]


    if len(available_questions) == 0:

        return jsonify({
            "success": False,
            "message": "Kategori tidak memiliki soal."
        })


    jumlah = min(
        jumlah,
        len(available_questions)
    )


    selected = available_questions.sample(
        jumlah
    )


    questions = []


    for index, row in selected.iterrows():

        questions.append({

            "soal": row["soal"],

            "pilihan_a": row["pilihan_a"],

            "pilihan_b": row["pilihan_b"],

            "pilihan_c": row["pilihan_c"],

            "pilihan_d": row["pilihan_d"],

            "jawaban": row["jawaban"],

            "kategori": row["kategori"]

        })


    return jsonify({

        "success": True,

        "questions": questions

    })


# =====================================================
# 11. CEK JAWABAN QUIZ
# =====================================================

@app.route("/check-quiz", methods=["POST"])
def check_quiz():

    data = request.get_json()

    answers = data.get(
        "answers",
        []
    )

    correct = 0


    for answer in answers:

        if (
            answer["user_answer"]
            == answer["correct_answer"]
        ):

            correct += 1


    total = len(answers)


    if total > 0:

        score = (
            correct / total
        ) * 100

    else:

        score = 0


    return jsonify({

        "success": True,

        "correct": correct,

        "wrong": total - correct,

        "total": total,

        "score": round(
            score,
            2
        )

    })


# =====================================================
# 12. RUN APPLICATION
# =====================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )