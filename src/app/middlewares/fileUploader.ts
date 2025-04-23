import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, path.join( "/var/www/uploads"));
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: async function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// upload single image
const uploadProfileImage = upload.single("profileImage");
const uploadBannerImage = upload.single("image");
const uploadMultiple = upload.array("images");

export const fileUploader = {
  upload,
  uploadProfileImage,
  uploadBannerImage,
  uploadMultiple,
};
