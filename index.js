const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')

const sqlite = require('sqlite')
const dbConnection = sqlite.open('banco.sqlite', { Promise })

const port = process.env.PORT || 3000

if (process.env.NODE_ENV === 'production') {
    app.set('view engine', 'ejs')
    app.use(express.static('public'));
    app.get('*', (request, response) => {
        response.sendFile(path.join(__dirname, 'index.js'));
    });
}

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', async (request, response) => {
    const db = await dbConnection
    const categoriasDB = await db.all('select * from categorias;')
    const Vagas = await db.all('select * from Vagas;')
    const categorias = categoriasDB.map(cat => {
        return {
            ...cat,
            Vagas: Vagas.filter(Vagas => Vagas.categoria === cat.id)
        }
    })

    response.render('home', {
        categorias
    })
})
app.get('/Vagas/:id', async (request, response) => {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id =' + request.params.id)

    response.render('Vagas', {
        vaga
    })
})
app.get('/admin', (req, res) => {
    res.render('admin/home')
})
app.get('/admin/vagas', async (req, res) => {
    const db = await dbConnection
    const Vagas = await db.all('select * from Vagas;')
    res.render('admin/vagas', { Vagas })

})
app.get('/admin/vagas/delete/:id', async (req, res) => {
    const db = await dbConnection
    await db.run('delete from vagas where id = ' + req.params.id + ' ')
    res.redirect('/admin/vagas')
})
app.get('/admin/vagas/nova', async (req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga', { categorias })
})
app.post('/admin/vagas/nova', async (req, res) => {
    const { titulo, descricao, categoria } = req.body
    const db = await dbConnection
    await db.run(`insert into Vagas(categoria, titulo, descricao ) values(${categoria},'${titulo}', '${descricao}')`)
    res.redirect('/admin/vagas')

})
app.get('/admin/vagas/editar/:id', async (req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const Vagas = await db.get('select * from vagas where id = ' + req.params.id)
    res.render('admin/editar-vaga', { categorias, Vagas })
})
app.post('/admin/vagas/editar/:id', async (req, res) => {
    const { titulo, descricao, categoria } = req.body
    const { id } = req.params
    const db = await dbConnection
    await db.run(`update Vagas set categoria =${categoria} , titulo ='${titulo}' , descricao = '${descricao}' where id = ${id}`)
    res.redirect('/admin/vagas')

})
app.get('/admin/categorias', async (req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias;')
    res.render('admin/categorias', { categorias })
})
app.get('/admin/categorias/delete/:id', async (req, res) => {
    const db = await dbConnection
    await db.run('delete from categorias where id = ' + req.params.id + ' ')
    res.redirect('/admin/categorias')
})
app.get('/admin/categorias/nova', async (req, res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-categoria', { categorias })
})

const init = async () => {
    const db = await dbConnection
    await db.run('create table if not exists categorias(id INTEGER PRIMARY KEY, categoria TEXT);')
    await db.run('create table if not exists Vagas(id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT);')
    //const categoria = 'Marketing Team'
    //await db.run(`insert into categorias(categoria) values('${categoria}')`)
    const Vagas = 'Social Media (San Francisco) '
    const descricao = 'Vaga para Fullstack developer que fez o Fullstack lab'
    //await db.run(`insert into Vagas(categoria, titulo, descricao ) values(2,'${Vagas}', '${descricao}')`)
}
init()


app.listen(port, (err) => {
    if (err) {
        console.log('Nao foi possivel iniciar o servidor do Jobfy.')
    } else {
        console.log('Servidor do Jobfy  funcionando normalmente...')
    }
})
