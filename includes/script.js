/* =========================================================
   ELEMENTOS
========================================================= */

const gamesContainer =
    document.getElementById("games");

const search =
    document.getElementById("search");

const playerModal =
    document.getElementById("playerModal");

const playerTitle =
    document.getElementById("playerTitle");

const closePlayer =
    document.getElementById("closePlayer");

const loading =
    document.getElementById("loading");

const progressBar =
    document.getElementById("progressBar");

const percent =
    document.getElementById("percent");

const loadingText =
    document.getElementById("loadingText");

const errorBox =
    document.getElementById("error");


/* =========================================================
   FAVORITOS
========================================================= */

let favoritos =
    JSON.parse(
        localStorage.getItem("gb_favoritos") || "[]"
    );


function guardarFavoritos(){

    localStorage.setItem(
        "gb_favoritos",
        JSON.stringify(favoritos)
    );

}


/* =========================================================
   VARIABLES
========================================================= */

let progresoInterval = null;


/* =========================================================
   MOSTRAR JUEGOS
========================================================= */

function mostrarJuegos(lista = juegos){

    gamesContainer.innerHTML = "";

    if(lista.length === 0){

        gamesContainer.innerHTML = `

            <p style="
                color:#858b96;
                grid-column:1/-1;
                text-align:center;
                padding:30px;
            ">

                No se encontraron juegos.

            </p>

        `;

        return;
    }


    lista.forEach(juego => {

        const card =
            document.createElement("article");

        card.className = "game";


        const esFavorito =
            favoritos.includes(juego.id);


        card.innerHTML = `

            <button
                class="favorite ${esFavorito ? "active" : ""}"
                aria-label="Favorito"
            >
                ${esFavorito ? "★" : "☆"}
            </button>


            <div class="cover">

                <img
                    src="${juego.cover}"
                    alt="${juego.name}"
                    loading="lazy"
                    onerror="
                        this.style.display='none';
                    "
                >

            </div>


            <div class="info">

                <div class="game-name">
                    ${juego.name}
                </div>


                <button class="play">
                    ▶ JUGAR
                </button>

            </div>

        `;


        const favorite =
            card.querySelector(".favorite");


        favorite.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if(favoritos.includes(juego.id)){

                    favoritos =
                        favoritos.filter(
                            id => id !== juego.id
                        );

                }else{

                    favoritos.push(juego.id);

                }


                guardarFavoritos();


                mostrarJuegos(
                    filtrar(search.value)
                );

            }
        );


        const play =
            card.querySelector(".play");


        play.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                abrirJuego(juego);

            }
        );


        gamesContainer.appendChild(card);

    });

}


/* =========================================================
   BUSCAR
========================================================= */

function filtrar(texto){

    texto =
        texto
        .toLowerCase()
        .trim();


    if(!texto){

        return juegos;

    }


    return juegos.filter(
        juego =>
            juego.name
            .toLowerCase()
            .includes(texto)
    );

}


search.addEventListener(
    "input",
    () => {

        mostrarJuegos(
            filtrar(search.value)
        );

    }
);


/* =========================================================
   CONFIGURAR EMULATORJS
========================================================= */

function configurarEmulador(juego){

    /*
       Si el juego no tiene "system",
       usamos Game Boy como opción
       predeterminada.
    */

    const sistema =
        (juego.system || "gb").toLowerCase();


    window.EJS_player =
        "#player";


    /*
       Núcleo que utilizará EmulatorJS.

       gb  = Game Boy
       gba = Game Boy Advance
       nes = NES
    */

    window.EJS_core =
        sistema;


    window.EJS_gameUrl =
        juego.rom;


    window.EJS_gameName =
        juego.name;


    window.EJS_gameID =
        "game_" + juego.id;


    window.EJS_pathtodata =
        "https://cdn.emulatorjs.org/stable/data/";


    window.EJS_startOnLoaded =
        true;


    /*
       Controles según sistema
    */

    if(sistema === "nes"){

        window.EJS_controlScheme =
            "nes";

    }else if(sistema === "gba"){

        window.EJS_controlScheme =
            "gba";

    }else{

        window.EJS_controlScheme =
            "gameboy";

    }

}


/* =========================================================
   ABRIR JUEGO
========================================================= */

function abrirJuego(juego){

    playerModal.style.display = "flex";


    playerTitle.textContent =
        "🎮 " + juego.name;


    loading.style.display = "flex";

    errorBox.style.display = "none";


    progressBar.style.width =
        "0%";


    percent.textContent =
        "0%";


    loadingText.textContent =
        "Preparando emulador...";


    /*
       Configuramos el núcleo antes
       de cargar EmulatorJS.
    */

    configurarEmulador(juego);


    let progreso = 0;


    if(progresoInterval){

        clearInterval(
            progresoInterval
        );

    }


    progresoInterval =
        setInterval(() => {

            if(progreso < 90){

                progreso += 4;


                if(progreso > 90){

                    progreso = 90;

                }


                progressBar.style.width =
                    progreso + "%";


                percent.textContent =
                    progreso + "%";


                if(progreso < 30){

                    loadingText.textContent =
                        "Descargando recursos...";

                }else if(progreso < 60){

                    loadingText.textContent =
                        "Preparando controles...";

                }else{

                    loadingText.textContent =
                        "Finalizando recursos...";

                }

            }

        },180);


    /* =====================================================
       LIMPIAR EMULATORJS ANTERIOR
    ===================================================== */

    const anterior =
        document.getElementById(
            "emulatorLoader"
        );


    if(anterior){

        anterior.remove();

    }


    /*
       Limpiar el reproductor antes
       de iniciar otro juego.
    */

    const elementosAnteriores =
        document.querySelectorAll(
            "#player > *:not(#loading)"
        );


    elementosAnteriores.forEach(
        elemento => {

            elemento.remove();

        }
    );


    /* =====================================================
       CARGAR EMULATORJS
    ===================================================== */

    const script =
        document.createElement("script");


    script.id =
        "emulatorLoader";


    script.src =
        "https://cdn.emulatorjs.org/stable/data/loader.js";


    script.onload = () => {

        setTimeout(() => {

            if(progresoInterval){

                clearInterval(
                    progresoInterval
                );

                progresoInterval = null;

            }


            progressBar.style.width =
                "100%";


            percent.textContent =
                "100%";


            loadingText.textContent =
                "Recursos listos";


            setTimeout(() => {

                loading.style.display =
                    "none";

            },800);

        },1600);

    };


    script.onerror = () => {

        if(progresoInterval){

            clearInterval(
                progresoInterval
            );

            progresoInterval = null;

        }


        loadingText.textContent =
            "No se pudieron descargar los recursos.";


        errorBox.style.display =
            "block";

    };


    document.body.appendChild(script);

}


/* =========================================================
   CERRAR EMULADOR
========================================================= */

closePlayer.addEventListener(
    "click",
    () => {

        if(progresoInterval){

            clearInterval(
                progresoInterval
            );

            progresoInterval = null;

        }


        playerModal.style.display =
            "none";


        location.reload();

    }
);


/* =========================================================
   ACERCA DE
========================================================= */

const aboutButton =
    document.getElementById(
        "aboutButton"
    );

const aboutModal =
    document.getElementById(
        "aboutModal"
    );

const aboutClose =
    document.getElementById(
        "aboutClose"
    );


aboutButton.addEventListener(
    "click",
    () => {

        aboutModal.style.display =
            "flex";

    }
);


aboutClose.addEventListener(
    "click",
    () => {

        aboutModal.style.display =
            "none";

    }
);


aboutModal.addEventListener(
    "click",
    event => {

        if(event.target === aboutModal){

            aboutModal.style.display =
                "none";

        }

    }
);


/* =========================================================
   INICIO
========================================================= */

mostrarJuegos();
