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

// Verificar estancia
async function verificarEstancia(habitacion) {
    try {
        const doc = await db.collection('habitaciones').doc(habitacion).get();
        if (!doc.exists) return false;
        const data = doc.data();
        const hoy = new Date().toISOString().split('T')[0];
        return data.ocupada && data.checkIn <= hoy && data.checkOut >= hoy;
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
}

// === LOGIN ===
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
                document.getElementById('mensajeLogin').innerText = 'Acceso expirado.';
                auth.signOut();
            }
        } catch (error) {
            document.getElementById('mensajeLogin').innerText = 'Credenciales incorrectas.';
        }
    });
}

// === PROTECCIÓN DE INDEX.HTML ===
const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/app-hotel-lamar/') || window.location.pathname === '/app-hotel-lamar/';
if (isIndexPage) {
    const habitacion = localStorage.getItem('habitacion');
    
    if (!habitacion) {
        window.location.href = 'login.html';
    } else {
        // Mostrar habitación
        const el = document.getElementById('numHabitacion');
        if (el) el.innerText = habitacion;

        // Verificar validez
        verificarEstancia(habitacion).then(valida => {
            if (!valida) {
                localStorage.removeItem('habitacion');
                alert('Tu estancia ha terminado.');
                window.location.href = 'login.html';
            }
        });

        // === BOTÓN CERRAR SESIÓN (CORREGIDO) ===
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                auth.signOut();
                localStorage.removeItem('habitacion');
                window.location.href = 'login.html';
            });
        }

        // Formularios
        const formAlquiler = document.getElementById('formAlquiler');
        if (formAlquiler) {
            formAlquiler.addEventListener('submit', (e) => {
                e.preventDefault();
                const cant = document.getElementById('cantidad').value;
                document.getElementById('mensajeAlquiler').innerHTML = `<span class="text-success">¡${cant} items en camino!</span>`;
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
