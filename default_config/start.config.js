module.exports = {
    type: 'http',
    port: 9080,
    server: 'http://0.0.0.0:5700',
    logLevel: 3,
    database: {
        mysql: {
            host: 'localhost',
            port: 3306,
            user: '',
            password: '',
            database: '',
        },
    }
}

