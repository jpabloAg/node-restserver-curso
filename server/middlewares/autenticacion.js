const jwt = require('jsonwebtoken');//este paquete posee una función para recuperar la información del token

// =====================
// Verificar Token
// =====================
let verificaToken = (req, res, next) => {
    let token = req.get('token');
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                error: {
                    message: 'no se proporciono ningun token o el token suministrado es incorrecto, acceso denegado'
                }
            });
        }
        // req.usuario es una propiedad que creamos en este middleware y la podemos usar en las peticiones e incluso 
        // en otros middlewares, siempre que esten en la misma petición en donde se implementara este middleware (verificaToken)
        req.usuario = decoded.usuario;
        /*decoded es el token decodificado, contiene la informacion del usuario y las fechas de experiación*/
        console.log(decoded);
        next();
    });
}


// =====================
// Verifica ADMIN_ROLE
// =====================
let verificaAdmin_Role = (req, res, next) => {
    //usamos el req.usuario que se creo en el middleware verificaToken
    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
}

module.exports = {
    verificaToken,
    verificaAdmin_Role
}