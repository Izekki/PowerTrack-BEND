
export const validateRegister = (req, res, next) => {
    const { nombre, correo, contraseña, proveedor } = req.body;
    
    //console.log(req.body);

    if (!nombre || !correo || !contraseña || !proveedor) return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    
    let errors = [];

    console.log("Los errores son:  \nValidar el nombre: " + validateName(nombre) + "\nValidar email: " + validateEmail(correo) + "\nValidar password: " + validatePassword(contraseña) + "\nValidar provedor" + validateProveedor(proveedor) )
    errors = [...errors, ...validateName(nombre), ...validateEmail(correo), ...validatePassword(contraseña), ...validateProveedor(proveedor)];

    if(errors.length > 0) return res.status(400).json({ message: errors.join(", ") });

    console.log("Validado correctamente");
    
    next();
  };

  function validateName(name){
    if(typeof name !== 'string') return ["El nombre debe ser una cadena de texto"];
    name = name.trim();
    if (name.length < 3) return ["El nombre debe tener al menos 3 caracteres"];
    if (name.length > 100) return ["El nombre no debe tener más de 100 caracteres"];
    if(!/^[A-Za-zÁÉÍÓÚáéíóúÑñ.0-9 ]+$/.test(name)) return ["El nombre solo puede contener letras, números y espacios"];
    return [];
  }

  function validatePassword(password){
    if(typeof password !== 'string') return ["La contraseña debe ser una cadena de texto"];
    if (password.length < 8) return ['La contraseña debe tener al menos 8 caracteres'];
    if (password.length > 20) return ['La contraseña no puede tener más de 20 caracteres'];
    if (password.includes(" ")) return ["El contraseña no puede contener espacios"];
    if (!/[0-9]/.test(password)) return ["La contraseña debe contener al menos un número"];
    if (!/[a-záéíóúñ]/.test(password)) return ["La contraseña debe contener al menos una letra minuscula"];
    if (!/[A-ZÁÉÍÓÚÑ]/.test(password)) return ["La contraseña debe contener al menos una letra mayuscula"];
    if (/(\w)\1{2,}/.test(password)) return ["La contraseña no puede tener más de 2 caracteres iguales seguidos"];
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9!@#$%^&/*]+$/.test(password)) return ['La contraseña solo puede contener letras, números y los siguientes caracteres especiales: !@#$%^&*/'];
    if (/12345|password/i.test(password)) return ["La contraseña no puede contener patrones comunes como '12345' o 'password'"];
    return [];
  }

  function validateEmail(email){
     if(typeof email !== 'string') return ["El correo debe ser una cadena de texto"];
     email = email.trim();
     if (email > 100) return ['El nombre no debe tener mas de 100 caracteres'];
     if (email.includes(" ")) return ["El correo no puede contener espacios"];
     //if (email.includes("_")) return ["El correo no puede contener guion bajo"];
     if (!/@/.test(email)) return ["El correo debe contener un @"];
     if(/.*@.*@.*/.test(email)) return ["El correo no puede contener dos @"];
     if(/ÁÉÍÓÚáéíóúÑñ/.test(email)) return ["El correo no puede contener ñ o letras con acento"];
     if(!/^[a-zA-Z0-9@.-]+$/.test(email)) return ["El correo solo puede contener letras, números, punto y guion medio."];
     if(/\d/.test(email.charAt(0))) return ["El correo no puede empezar con números"];
     if (email.startsWith("_")) return ["El correo no puede empezar con guion bajo"];
     if (email.startsWith("-")) return ["El correo no puede empezar con guion"];
     if (email.startsWith(".")) return ["El correo no puede empezar con guion punto"];
     if (email.includes("..")) return ["El correo no puede tener dos puntos consecutivos"];
     if (email.includes("--")) return ["El correo no puede tener dos guiones medios consecutivos"];
     if (email.includes("__")) return ["El correo no puede tener dos guiones consecutivos"];
     if (/(\w)\1{2,}/.test(email)) return ["La contraseña no puede tener más de 2 caracteres iguales seguidos"];
     const domain = email.split("@")[1];
     if (domain && (domain.includes("_") || domain.includes("-"))) return ["El correo no puede tener guion en el dominio"];
     return [];
  }


  function validateProveedor(proveedor){
    if(proveedor === undefined || proveedor === null || proveedor === '') return ["El proveedor es obligatorio"];
    if(isNaN(proveedor)) return ["El proveedor debe ser un número válido"];
   return [];
  }
