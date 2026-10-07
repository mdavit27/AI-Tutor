// =====================================================
// TANYA AI
// =====================================================

async function askAI() {

    const question =
        document.getElementById("question").value;

    const answer =
        document.getElementById("answer");


    if (!question.trim()) {

        answer.classList.remove("hidden");

        answer.innerHTML =
            "⚠️ Silakan masukkan pertanyaan.";

        return;
    }


    answer.classList.remove("hidden");

    answer.innerHTML =
        "⏳ Sedang mencari jawaban...";


    try {

        const response = await fetch(
            "/ask",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    question: question
                })

            }
        );


        const data =
            await response.json();


        if (!data.success) {

            answer.innerHTML =
                data.message;

            return;
        }


        answer.innerHTML = `

            <h3>🤖 Jawaban AI Tutor</h3>

            <p>
                ${data.answer}
            </p>

            <hr>

            <small>
                Kategori: ${data.category}
                <br>
                Tingkat kemiripan:
                ${data.score}%
            </small>

        `;

    }

    catch (error) {

        answer.innerHTML =
            "❌ Terjadi kesalahan pada sistem.";

        console.error(error);

    }

}



// =====================================================
// JELASKAN MATERI
// =====================================================

async function explainMaterial() {

    const material =
        document.getElementById("material").value;

    const explanation =
        document.getElementById("explanation");


    if (!material.trim()) {

        explanation.classList.remove(
            "hidden"
        );

        explanation.innerHTML =
            "⚠️ Silakan masukkan materi.";

        return;
    }


    explanation.classList.remove(
        "hidden"
    );


    explanation.innerHTML =
        "⏳ Sedang mencari materi yang sesuai...";


    try {

        const response = await fetch(
            "/explain",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    material: material
                })

            }
        );


        const data =
            await response.json();


        if (!data.success) {

            explanation.innerHTML =
                data.message;

            return;
        }


        explanation.innerHTML = `

            <h3>📚 Penjelasan Materi</h3>

            <p>
                ${data.answer}
            </p>

            <hr>

            <small>
                Kategori: ${data.category}
                <br>
                Tingkat kemiripan:
                ${data.score}%
            </small>

        `;

    }

    catch (error) {

        explanation.innerHTML =
            "❌ Terjadi kesalahan.";

        console.error(error);

    }

}



// =====================================================
// GENERATE QUIZ
// =====================================================

let currentQuiz = [];



async function generateQuiz() {

    const category =
        document.getElementById(
            "category"
        ).value;


    const jumlah =
        document.getElementById(
            "jumlah"
        ).value;


    const quiz =
        document.getElementById(
            "quiz"
        );


    const submitButton =
        document.getElementById(
            "submitQuiz"
        );


    const quizResult =
        document.getElementById(
            "quizResult"
        );


    quizResult.classList.add(
        "hidden"
    );


    quiz.innerHTML =
        "⏳ Menyiapkan soal...";


    try {

        const response =
            await fetch(
                "/generate-quiz",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        category:
                            category,

                        jumlah:
                            jumlah

                    })

                }
            );


        const data =
            await response.json();


        if (!data.success) {

            quiz.innerHTML =
                data.message;

            return;
        }


        currentQuiz =
            data.questions;


        let html = "";


        currentQuiz.forEach(
            (question, index) => {

                html += `

                <div class="quiz-question">

                    <h3>
                        ${index + 1}.
                        ${question.soal}
                    </h3>


                    <label>

                        <input
                            type="radio"
                            name="question${index}"
                            value="A"
                        >

                        A. ${question.pilihan_a}

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="question${index}"
                            value="B"
                        >

                        B. ${question.pilihan_b}

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="question${index}"
                            value="C"
                        >

                        C. ${question.pilihan_c}

                    </label>


                    <label>

                        <input
                            type="radio"
                            name="question${index}"
                            value="D"
                        >

                        D. ${question.pilihan_d}

                    </label>

                </div>

                `;

            }
        );


        quiz.innerHTML =
            html;


        submitButton.classList.remove(
            "hidden"
        );

    }

    catch (error) {

        quiz.innerHTML =
            "❌ Gagal membuat quiz.";

        console.error(error);

    }

}



// =====================================================
// SUBMIT QUIZ
// =====================================================

async function submitQuiz() {

    const answers = [];


    currentQuiz.forEach(
        (question, index) => {

            const selected =
                document.querySelector(
                    `input[name="question${index}"]:checked`
                );


            answers.push({

                user_answer:
                    selected
                        ? selected.value
                        : "",

                correct_answer:
                    question.jawaban

            });

        }
    );


    const response =
        await fetch(
            "/check-quiz",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    answers: answers
                })

            }
        );


    const data =
        await response.json();


    const result =
        document.getElementById(
            "quizResult"
        );


    result.classList.remove(
        "hidden"
    );


    result.innerHTML = `

        <h2>
            🎉 Hasil Quiz
        </h2>

        <p>
            Benar:
            <strong>
                ${data.correct}
            </strong>
        </p>

        <p>
            Salah:
            <strong>
                ${data.wrong}
            </strong>
        </p>

        <h2>
            Nilai:
            ${data.score}
        </h2>

    `;


    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });

}