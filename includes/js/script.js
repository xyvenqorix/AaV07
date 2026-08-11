/* =========================================================
   GAME BOY WEB
========================================================= */


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
   VARIABLES
========================================================= */

let juegos = [];

let favoritos =
    JSON.parse(
        localStorage.getItem("gb_favoritos") || "[]"
    );

let progresoInterval = null;


/* =========================================================
   GUARDAR FAVORITOS
========================================================= */

function guardarFavoritos(){

    localStorage.setItem(
        "gb_favoritos",
        JSON.stringify(favoritos)
    );

}


/* =========================================================
   LEER JUEGOS.TXT
========================================================= */

async function cargarJuegos(){

    try{

        const respuesta =
            await fetch("includes/juegos.txt");

        if(!respuesta.ok){

            throw new Error(
                "No se pudo abrir juegos.txt"
            );

        }

        const texto =
            await respuesta.text();

        juegos =
            interpretarJuegos(texto);

        mostrarJuegos(juegos);

    }catch(error){

        console.error(error);

        gamesContainer.innerHTML = `

            <p style="
                color:#ff7070;
                grid-column:1/-1;
                text-align:center;
                padding:30px;
            ">

                ❌ No se pudo cargar la lista
                de juegos.

                <br><br>

                Comprueba que exista:

                <br>

                <b>includes/juegos.txt</b>

            </p>

        `;

    }

}


/* =========================================================
   INTERPRETAR JUEGOS.TXT
========================================================= */

function interpretarJuegos(texto){

    const lineas =
        texto.split(/\r?\n/);

    const lista = [];

    let juego = null;


    lineas.forEach(linea => {

        linea = linea.trim();


        /* Ignorar líneas vacías */

        if(!linea){

            return;

        }


        /* Ignorar comentarios */

        if(linea.startsWith("#")){

            return;

        }


        /* Separar clave y valor */

        const posicion =
            linea.indexOf("=");


        if(posicion === -1){

            return;

        }


        const clave =
            linea
            .substring(0,posicion)
            .trim()
            .toLowerCase();


        const valor =
            linea
            .substring(posicion + 1)
            .trim();


        /* Nuevo juego */

        if(clave === "id"){

            if(juego){

                lista.push(juego);

            }


            juego = {

                id:valor,

                name:"",

                rom:"",

                cover:""

            };


            return;

        }


        /* Si todavía no existe un juego */

        if(!juego){

            return;

        }


        if(clave === "name"){

            juego.name = valor;

        }


        if(clave === "rom"){

            juego.rom = valor;

        }


        if(clave === "cover"){

            juego.cover = valor;

        }

    });


    /* Añadir último juego */

    if(juego){

        lista.push(juego);

    }


    return lista;

}


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
                aria-label="Favorito">

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


        /* =================================================
           FAVORITO
        ================================================= */

        const favorite =
            card.querySelector(".favorite");


        favorite.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if(
                    favoritos.includes(juego.id)
                ){

                    favoritos =
                        favoritos.filter(
                            id => id !== juego.id
                        );

                }else{

                    favoritos.push(
                        juego.id
                    );

                }


                guardarFavoritos();


                mostrarJuegos(
                    filtrar(search.value)
                );

            }
        );


        /* =================================================
           JUGAR
        ================================================= */

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

    window.EJS_player =
        "#player";

    window.EJS_core =
        "gb";

    window.EJS_gameUrl =
        juego.rom;

    window.EJS_gameName =
        juego.name;

    window.EJS_gameID =
        "gameboy_" + juego.id;

    window.EJS_pathtodata =
        "https://cdn.emulatorjs.org/stable/data/";

    window.EJS_startOnLoaded =
        true;

    window.EJS_controlScheme =
        "gameboy";

}


/* =========================================================
   ABRIR JUEGO
========================================================= */

function abrirJuego(juego){

    playerModal.style.display =
        "flex";


    playerTitle.textContent =
        "🎮 " + juego.name;


    loading.style.display =
        "flex";


    errorBox.style.display =
        "none";


    progressBar.style.width =
        "0%";


    percent.textContent =
        "0%";


    loadingText.textContent =
        "Preparando emulador...";


    configurarEmulador(juego);


    /* =====================================================
       PROGRESO VISUAL
    ===================================================== */

    let progreso = 0;


    if(progresoInterval){

        clearInterval(
            progresoInterval
        );

    }


    progresoInterval =
        setInterval(
            () => {

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

                    }

                    else if(progreso < 60){

                        loadingText.textContent =
                            "Preparando controles...";

                    }

                    else{

                        loadingText.textContent =
                            "Finalizando recursos...";

                    }

                }

            },
            180
        );


    /* =====================================================
       CARGAR EMULATORJS
    ===================================================== */

    const anterior =
        document.getElementById(
            "emulatorLoader"
        );


    if(anterior){

        anterior.remove();

    }


    const script =
        document.createElement("script");


    script.id =
        "emulatorLoader";


    script.src =
        "https://cdn.emulatorjs.org/stable/data/loader.js";


    script.onload =
        () => {

            setTimeout(
                () => {

                    if(progresoInterval){

                        clearInterval(
                            progresoInterval
                        );

                        progresoInterval =
                            null;

                    }


                    progressBar.style.width =
                        "100%";


                    percent.textContent =
                        "100%";


                    loadingText.textContent =
                        "Recursos listos";


                    setTimeout(
                        () => {

                            loading.style.display =
                                "none";

                        },
                        800
                    );

                },
                1600
            );

        };


    script.onerror =
        () => {

            if(progresoInterval){

                clearInterval(
                    progresoInterval
                );

                progresoInterval =
                    null;

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

            progresoInterval =
                null;

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
    document.getElementById("aboutButton");

const aboutModal =
    document.getElementById("aboutModal");

const aboutClose =
    document.getElementById("aboutClose");


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

        if(
            event.target === aboutModal
        ){

            aboutModal.style.display =
                "none";

        }

    }
);


/* =========================================================
   INICIAR
========================================================= */

cargarJuegos();
