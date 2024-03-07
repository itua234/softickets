const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: "capital-votes",
    api_key: "854267636897222",
    api_secret: "ugGYpXbp05hu78OW-Wld_0KLelY"
});

module.exports = {
    upload: async(path) => {
        try {
            const result = await cloudinary.uploader.upload(path);
            console.log(result);
            return result;
        } catch (error) {
            console.error('server error:', error);
        }
    }
}
