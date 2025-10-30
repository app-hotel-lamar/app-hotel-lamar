const firebaseConfig = {
  apiKey: "AIzaSyDpq3YMrlEZcIi7OtycAt0Ed4O44t0GsrI",
  authDomain: "hotel-boutique-la-mar-46cc3.firebaseapp.com",
  projectId: "hotel-boutique-la-mar-46cc3",
  storageBucket: "hotel-boutique-la-mar-46cc3.firebasestorage.app",
  messagingSenderId: "716925805143",
  appId: "1:716925805143:web:52a16639ced1afabb83912",
  measurementId: "G-H4MDGV1GGT"
};
// ========================================

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// === FUNCIÓN VERIFICAR ESTANCIA (CORREGIDA) ===
async function verificarEstancia(habitacion) {
    try {
        const doc = await db.collection('habitaciones').doc(habitacion).get();
        if (!doc.exists) {
            console.log("No existe el documento:", habitacion);
            return false;
        }
        const data = doc.data();
        const hoy = new Date().toISOString().split('T')[0]; // 2025-10-30
        console.log("Hoy:", hoy, "| checkIn:", data.checkIn, "| checkOut:", data.checkOut);
        return data.ocupada && data.checkIn <= hoy && data.checkOut >= hoy;
    } catch (error) {
        console.error("Error verificando estancia:", error);
        return false;
    }
}

// === LOGIN (login.html) ===
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const habitacion = document.getElementById('habitacion').value.trim();
        const password = document.getElementById('password').value;
        const email = `habitacion${habitacion}@hotel-lamar.com`;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            const valida = await verificarEstancia(habitacion);
            if (valida) {
                localStorage.setItem('habitacion', habitacion);
                window.location.href = 'index.html';
            } else {
                document.getElementById('mensajeLogin').innerText = 'Acceso expirado o habitación no ocupada.';
                auth.signOut();
            }
        } catch (error) {
            document.getElementById('mensajeLogin').innerText = 'Habitación o contraseña incorrecta.';
            console.error("Error login:", error);
        }
    });
}

// === PROTECCIÓN index.html ===
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    const habitacion = localStorage.getItem('habitacion');
    if (!habitacion) {
        window.location.href = 'login.html';
    } else {
        document.getElementById('numHabitacion').innerText = habitacion;

        verificarEstancia(habitacion).then(valida => {
            if (!valida) {
                localStorage.removeItem('habitacion');
                alert('Tu estancia ha terminado.');
                window.location.href = 'login.html';
            }
        });

        // Logout
        document.getElementById('btnLogout').addEventListener('click', () => {
            auth.signOut();
            localStorage.removeItem('habitacion');
            window.location.href = 'login.html';
        });

        // Formularios
        const formAlquiler = document.getElementById('formAlquiler');
        if (formAlquiler) {
            formAlquiler.addEventListener('submit', (e) => {
                e.preventDefault();
                const cant = document.getElementById('cantidad').value;
                document.getElementById('mensajeAlquiler').innerHTML = `<span class="text-success">¡${cant} items solicitados!</span>`;
            });
        }

        const formDesayuno = document.getElementById('formDesayuno');
        if (formDesayuno) {
            formDesayuno.addEventListener('submit', (e) => {
                e.preventDefault();
                const fecha = document.getElementById('fecha').value;
                document.getElementById('mensajeDesayuno').innerHTML = `<span class="text-success">Desayuno reservado: ${fecha}</span>`;
            });
        }
    }
}