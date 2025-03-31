const cookieParser = require('cookie-parser')
const express = require('express')
const app = express()

const path = require('path')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const User = require("./model/user")
const Post = require("./model/post")
const { assert } = require('console')
const { arrayBuffer } = require('stream/consumers')

app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())






app.get('/', (req, res) => {
    res.render('index')
})

app.get('/sign')
app.post('/signup', async (req, res) => {
    const { name, email, password, age, username } = req.body

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            const userdata = await User.create({
                name, email, password: hash, age, username
            })
            const token = jwt.sign({ email: email, user: userdata._id }, "chup")
            res.cookie("token", token)
            res.redirect('/')
        })

    })
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {

    const { email, password } = req.body
    const userdata = await User.findOne({ email })
    if (!userdata) {
        return res.status(404).send({ message: "User Not Found" })
    }

    bcrypt.compare(password, userdata.password, (err, user) => {
        if (user) {
            const token = jwt.sign({ email: userdata.email, user: userdata.id }, "chup")
            res.cookie("token", token)
            res.redirect('/profile')
        } else {
            console.log(err);
        }
    })

})

app.get('/profile', authMiddleware, async (req, res) => {
    let user = await User.findOne({ email: req.user.email }).populate("posts")
    res.render("profile", { user })

})



app.get('/logout', (req, res) => {
    res.clearCookie("token")
    res.redirect('/')
})


app.post("/send-post", authMiddleware, async (req, res) => {
    const { postContent } = req.body
    const { email, user: userId } = req.user


    let post = await Post.create({
        content: postContent,
        users: userId
    })
    console.log(post);
    let user = await User.findOne({ email })
    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")
})

app.get('/like/:id', authMiddleware, async (req, res) => {
    const { id } = req.params.id

    const post = await Post.findOne({ id }).populate("users")
    if (post.likes.indexOf(req.user.user) === -1) {
        post.likes.push(req.user.user)
    } else {
        post.likes.splice(post.likes.indexOf(req.user.user), 1)
    }
    await post.save()
    console.log(post);

    res.redirect("/profile")

})

app.get("/edit/:id", authMiddleware, async (req, res) => {
    // res.render("edit")
    const { id } = req.params.id
    const post = await Post.findOne({ id }).populate("users")
    res.render("edit", { post })
    console.log(post);
})

app.post("/edit/:id", authMiddleware, async (req, res) => {
    const { postContent: content  } = req.body
    console.log(content);
    const { id } = req.params.id
    const post = await Post.findOne({ id }).populate("users")
    post.content = content
    await post.save()
    res.redirect("/profile")

})
app.get("/delete/:id", authMiddleware, async (req, res) => {
    const { id } = req.params.id
     await Post.findOneAndDelete({ id })
    res.redirect("/profile")
})


function authMiddleware(req, res, next) {
    if (req.cookies.token) {
        const token = req.cookies.token
        jwt.verify(token, "chup", (err, decoded) => {
            if (err) {
                res.clearCookie("token")
                res.status(401).redirect("/login")
            }
            req.user = decoded

            next()
        })
    } else {
        res.status(401).redirect("/login")
    }
}
app.listen(3000, () => {
    console.log('Server is running on port 3000')
})