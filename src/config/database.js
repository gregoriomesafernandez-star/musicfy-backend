const mongoose = require("mongoose");
require('dotenv').config();

const bcrypt = require("bcrypt");
const User = require("../models/User");

//Creamos usuario ADMIN si no existe
const createAdmin = async () => {
    const adminExists = await User.findOne({
        role: "ROLE_ADMIN"
    });

    if (adminExists) {
        console.log("Administrador ya existente");
        return;
    }

    const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        10
    );

    const admin = new User({
        name: "Admin",
        surname: "Musicfy",
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: "ROLE_ADMIN",
        image: "default.png"
    });

    await admin.save();

    console.log("Administrador inicial creado");
};

//Conectamos con la BD
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Conectado a la base de datos: musicfy");

        await createAdmin();

    } catch (error) {
        console.log("Error al conectar con la base de datos:", error);
        throw error;
    }
};

module.exports = connectDB;