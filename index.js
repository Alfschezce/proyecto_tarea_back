const express = require("express");//me traigo express

require("dotenv").config();//me traigo dotenv para usar variables de entorno
const { json } = require("body-parser");//me traigo json
const cors = require("cors")
//importamos los metodos
const { leerTarea, borrarTarea, crearTarea, actualizarEstado, actualizarTexto } = require("./db");
//ponemos en marcha el servidor con express
const servidor = express();
// para unir diferentes dominios
servidor.use(cors());
//para extraer el cuerpo de la peticion
servidor.use(json());

//establezco de momento una url estatica
// servidor.use("/alfredo", express.static("./pruebas"))


//metodo para leer las tareas
servidor.get("/api-tareas", async (peticion, respuesta) => {

    try {

        // cogemos las tareas que vienen de la funcion 
        let tareas = await leerTarea();
        //hacemos un map de tareas para quitar la barra baja resultante
        tareas = tareas.map(({ _id, tarea, terminada }) => { return { id: _id, tarea, terminada } });

        respuesta.json(tareas)
        // Devolvemos las tareas como respuesta en formato JSON
    } catch (error) {
        //en caso de error
        respuesta.status(500)
        respuesta.json(error)


    }






});



//metodo para crear la tarea
//usamos siguiente para el manejo de errores
servidor.post("/api-tareas/crear", async (peticion, respuesta, siguiente) => {


    let { tarea } = peticion.body;//aqui extraigo la tarea de peticion.body
    //controlo que la tarea exista y no este vacia
    if (tarea && tarea.trim() != "") {

        try {

            let id = await crearTarea({ tarea });//intentamos crear la tarea
            return respuesta.json(id);// Devolvemos el id de la tarea creada como respuesta en formato JSON

        } catch (error) {
            //si hay error
            respuesta.status(500)
            return respuesta.json(error)
        }
    }
    // Si la tarea está vacía, llamamos al siguiente middleware con un objeto de error
    siguiente({ error: "no tiene el argumento tarea el objeto JSON" })

});



//metodo para borrar la tarea, estableciendo una expresion regular
servidor.delete("/api-tareas/borrar/:id([a-f0-9]{24})", async (peticion, respuesta) => {

    try {
        let cantidad = await borrarTarea(peticion.params.id);// Intentamos borrar la tarea con el ID especificado
        // Devolvemos el resultado de la operación como respuesta en formato JSON
        return respuesta.json({ resultado: cantidad > 0 ? "ok" : "ko" });

    } catch (error) {
        //si hay error 
        respuesta.status(500);
        return respuesta.json(error);


    }

});



//metodo para actualizar estableciendo una expresion regular 


servidor.put("/api-tareas/actualizar/:id([a-f0-9]{24})/:operacion(1|2)", async (peticion, respuesta) => {



    // lo que ha escrito el usuario  y lo guardamos como numero en operacion

    let operacion = Number(peticion.params.operacion);



    // 1 o 2

    let operaciones = [actualizarTexto, actualizarEstado]; //almaceno en un array las dos funciones

    //1- actualizar texto, 2- actualizar estado



    let { tarea } = peticion.body;



    //si la operación no es 1 salta al catch

    if (operacion == 1 && (!tarea || tarea.trim() == "")) { //compruebo tarea en negativo, si falla, me da verdadero, si está es falso



        return siguiente({ error: "falta el argumento tarea en el objeto JSON" });

    }



    try {// en operacion entra 1 o 2, si es 1 -1 es indice 0 actualizarTexto y si es si es 2 es 2 -1 es indice 1 actualizarEstado

        let cantidad = await operaciones[operacion - 1](peticion.params.id, operacion == 1 ? tarea : null);



        respuesta.json({ resultado: cantidad ? "ok" : "ko" });



    } catch (error) {



        respuesta.status(500);

        respuesta.json(error);

    }

});

//metodo de control si no encajan las peticiones que hace el usuarios

servidor.use((peticion, respuesta) => {

    respuesta.status(404)
    respuesta.json({ error: "no encontrado" })
})

//si las cosas no vienen bien en la peticion o no son en formato correcto

servidor.use((error, peticion, respuesta, siguiente) => {

    respuesta.status(400)
    respuesta.json({ error: "peticion erronea" })
})
//ponemos a escuchar al servidor en la variable de entorno configurada 
servidor.listen(process.env.PORT)