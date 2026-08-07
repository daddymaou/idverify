import { Router, Request, Response } from 'express';
import multer from 'multer';
import { verifyId } from '@daddymaou/idverify';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Use PNG, JPG, or WebP.'));
  },
});

router.post('/', upload.single('idImage'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image provided.' });
    return;
  }

  try {
    const result = await verifyId(req.file.buffer);
    res.json(result);
  } catch (err: any) {
    console.error('[/api/verify]', err);
    res.status(422).json({ error: err.message || 'Could not process image.' });
  }
});

export default router;