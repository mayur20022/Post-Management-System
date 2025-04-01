const multer = require('multer')
const crypto = require('crypto')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, './public/image/uploads')
    },
    filename: (req, file, cd) => {
        crypto.randomBytes(12, (err, byts) => {
            const fn = byts.toString('hex') + path.extname(file.originalname)
            cd(null, fn)
        })
    }
})

const uploads = multer({ storage: storage })

module.exports = uploads