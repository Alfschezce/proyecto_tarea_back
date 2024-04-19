const { MongoClient, ObjectId } = require("mongodb");//me traigo Mongoclient y Objetid del paquete mongo
require("dotenv").config();//importamos dotenv para usar variables de entorno

//Comenzamos a construir cada una de los metodos  que controlaran el Backend

//Funcion para conectarnos a la base de datos, se hacen las pruebas con then y catch para ver si funciona la conexion y funciona correctamente

function conectar() {

    return MongoClient.connect(process.env.URL_DB);

}

//Funcion para leer las tareas

function leerTarea() {
    //retornara una promesa 
    return new Promise(async (ok, ko) => {

        try {

            const conexion = await conectar();//nos conectamos a la base de datos

            let coleccion = conexion.db("tareas").collection("tareas")//nos conectamos a nuestra carpeta de la base de datos

            let tareas = await coleccion.find({}).toArray();//le decimos que encuentre el objeto de la base de datos  y lo convierta en un array

            conexion.close()//cortamos la conexion

            ok(tareas)//devolvemos el array de tareas al cumplirse la promesa

        } catch (error) {

            ko({ error: "error en base de datos" })
        }

    })

}

//funcion para crear las tareas

function crearTarea(tarea) {

    return new Promise(async (ok, ko) => {

        try {

            const conexion = await conectar();//nos conectamos en la base de datos

            let coleccion = conexion.db("tareas").collection("tareas")//nos conectamos mi coleccion de tareas en la base de datos
            tarea.terminada = false//al crear la tarea partimos de false
            let { insertedId } = await coleccion.insertOne(tarea);//desestructuramos insertId que viene de insertar la tarea en la coleccion

            conexion.close()//cerramos la conexion

            ok({ id: insertedId })//desestructuramos el id y lo mandamos
            //si hay error
        } catch (error) {

            ko({ error: "error en base de datos" })
        }

    })

}


//Establecemos la funcion para borrar las tareas

function borrarTarea(id) {

    return new Promise(async (ok, ko) => {

        try {
            //nos conectamos en la base de datos
            const conexion = await conectar();
            //nos conectamos mi coleccion de tareas en la base de datos
            let coleccion = conexion.db("tareas").collection("tareas")
            //desestructuramos deletedCount que podra ser 1 o 0
            let { deletedCount } = await coleccion.deleteOne({ _id: new ObjectId(id) });
            //cerramos la conexion
            conexion.close()
            //si se cumple la promesa pasamos el deletedCount
            ok(deletedCount)
            //si hay error
        } catch (error) {

            ko({ error: "error en base de datos" })
        }

    })

}


//Establecemos la funcion para actualizar el estado

function actualizarEstado(id) {

    return new Promise(async (ok, ko) => {



        try {
            //nos conectamos en la base de datos
            let conexion = await conectar();



            //acceso a la coleccion tareas

            let coleccion = conexion.db("tareas").collection("tareas");



            //buscamos la tarea por el id

            let tarea = await coleccion.findOne({ _id: new ObjectId(id) });



            //invertimos el estado de la tarea

            let nuevoEstado = !tarea.terminada;



            //actualizamos el estado de la tarea con su id correspondiente

            let { modifiedCount } = await coleccion.updateOne({ _id: new ObjectId(id) }, { $set: { terminada: nuevoEstado } });



            //cerramos la conexión

            conexion.close();



            //vemos si realmente se ha modificado la tarea

            if (modifiedCount === 1) {



                ok(modifiedCount);



            } else {



                throw new Error("No se pudo actualizar la tarea");



            }



        } catch (error) {



            ko({ error: "error en base de datos" })

        }

    })

}



//creamos una función para actualizar el texto

function actualizarTexto(id, tarea) {

    return new Promise(async (ok, ko) => {



        try {


            //nos conectamos en la base de datos
            let conexion = await conectar();


            //nos conectamos mi coleccion de tareas en la base de datos
            let coleccion = conexion.db("tareas").collection("tareas");



            //actualizamos la tarea correspondiente

            let actualizar = await coleccion.updateOne({ _id: new ObjectId(id) }, { $set: { tarea: tarea } });



            //cerramos la conexión

            conexion.close();



            //cumplimos la promesa

            ok(actualizar);



        } catch (error) {

            //si hay error

            ko({ error: "error en base de datos" })

        }

    })

}







//Exportamos los metodos
module.exports = { leerTarea, crearTarea, borrarTarea, actualizarTexto, actualizarEstado }