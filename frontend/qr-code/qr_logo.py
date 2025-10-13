
import qrcode
from PIL import Image

# URL del sitio
url = "https://webshield100.onrender.com"

# Generar el QR
qr = qrcode.QRCode(
    version=2,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)
qr.add_data(url)
qr.make(fit=True)

# Crear imagen del QR (negro sobre blanco)
qr_img = qr.make_image(fill_color="black", back_color="white").convert("RGB")

# Cargar el logo (escudo)
logo = Image.open("logo192.png")  # <- poné tu logo en el mismo folder

# Ajustar tamaño del logo (máx 20% del QR)
qr_width, qr_height = qr_img.size
logo_size = int(qr_width * 0.2)
logo = logo.resize((logo_size, logo_size))

# Pegar logo al centro
pos = ((qr_width - logo_size) // 2, (qr_height - logo_size) // 2)
qr_img.paste(logo, pos, mask=logo if logo.mode == "RGBA" else None)

# Guardar resultado
qr_img.save("webshield_qr_logo.png")
print("✅ QR con logo generado: webshield_qr_logo.png")
