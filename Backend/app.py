from flask import Flask, jsonify, request
from flask_pymongo import PyMongo, GridFS
from flask_cors import CORS
from dotenv import load_dotenv
import os
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId
import hashlib  # Para hashear la contraseña con MD5
from flask_mail import Mail, Message  # Para enviar correos
import datetime

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de MongoDB Atlas
mongodb_uri = os.getenv('MONGO_URI')
if not mongodb_uri:
    raise ValueError("No MONGO_URI found in environment variables")

print(f"Connecting to MongoDB with URI: {mongodb_uri}")  # Para debug

mail_username = os.getenv('MAIL_USERNAME')
mail_password = os.getenv('MAIL_PASSWORD')

# Configurar la conexión a MongoDB
app.config["MONGO_URI"] = mongodb_uri
mongo = PyMongo(app)

# Inicializar GridFS
fs = GridFS(mongo.db)

# Configuración para archivos subidos
ALLOWED_EXTENSIONS = {'pdf'}  # Solo permitir archivos PDF

# Función para verificar extensiones de archivo permitidas
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Función para hashear la contraseña usando MD5
def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()  # Retorna el hash en formato hexadecimal

# Ruta para registrar un nuevo usuario
@app.route('/register', methods=['POST'])
def register():
    try:
        # Asegurarse de que la solicitud es JSON
        if not request.is_json:
            return jsonify({"message": "Missing JSON in request"}), 400

        data = request.get_json()
        
        print(f"Registration attempt for user: {data.get('username')}")

        # Validar campos requeridos
        required_fields = ['username', 'password', 'name', 'email', 'userType']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"message": f"Field {field} is required"}), 400

        # Verificar si el usuario ya existe
        existing_user_empleados = mongo.db.empleados.find_one({'username': data['username']})
        existing_user_admin = mongo.db.administradores.find_one({'username': data['username']})

        if existing_user_empleados or existing_user_admin:
            return jsonify({"message": "User already exists"}), 400

        # Crear el nuevo usuario
        new_user = {
            'username': data['username'],
            'password': hash_password(data['password']),
            'name': data['name'],
            'email': data['email'],
            'phone': data.get('phone', ''),
            'userType': data['userType']
        }

        if data['userType'] == 'employee':
            new_user['employeeNumber'] = data.get('employeeNumber', '')
            mongo.db.empleados.insert_one(new_user)
        elif data['userType'] == 'admin':
            mongo.db.administradores.insert_one(new_user)
        else:
            return jsonify({"message": "Invalid user type"}), 400

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    try:
        data = request.get_json()  # Cambiar esto
        # files = request.files  # Eliminar esto, no se usa en tu caso

        print(f"Registration attempt for user: {data.get('username')}")

        # Verificar si el usuario ya existe
        existing_user_empleados = mongo.db.empleados.find_one({'username': data.get('username')})
        existing_user_admin = mongo.db.administradores.find_one({'username': data.get('username')})

        if existing_user_empleados or existing_user_admin:
            return jsonify({"message": "User already exists"}), 400

        # Hashear la contraseña
        hashed_password = hash_password(data.get('password'))

        # Crear el nuevo usuario
        new_user = {
            'username': data.get('username'),
            'password': hashed_password,
            'name': data.get('name'),
            'email': data.get('email'),
            'phone': data.get('phone', ''),  # Agregar valor por defecto
            'userType': data.get('userType')
        }

        if data.get('userType') == 'employee':
            new_user['employeeNumber'] = data.get('employeeNumber', '')  # Valor por defecto
            mongo.db.empleados.insert_one(new_user)
        elif data.get('userType') == 'admin':
            mongo.db.administradores.insert_one(new_user)
        else:
            return jsonify({"message": "Invalid user type"}), 400

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    try:
        data = request.form.to_dict()
        files = request.files

        print(f"Registration attempt for user: {data.get('username')}")  # Para debug

        # Verificar si el usuario ya existe en ambas colecciones
        existing_user_empleados = mongo.db.empleados.find_one({'username': data.get('username')})
        existing_user_admin = mongo.db.administradores.find_one({'username': data.get('username')})

        if existing_user_empleados or existing_user_admin:
            return jsonify({"message": "User already exists"}), 400

        # Hashear la contraseña antes de guardarla
        hashed_password = hash_password(data.get('password'))

        # Crear el nuevo usuario
        new_user = {
            'username': data.get('username'),
            'password': hashed_password,  # Guardar la contraseña hasheada
            'name': data.get('name'),
            'email': data.get('email'),
            'phone': data.get('phone'),
            'userType': data.get('userType')
        }

        # Campos específicos para empleados
        if data.get('userType') == 'employee':
            new_user['employeeNumber'] = data.get('employeeNumber')
            mongo.db.empleados.insert_one(new_user)
        
        # Campos específicos para administradores
        elif data.get('userType') == 'admin':
            mongo.db.administradores.insert_one(new_user)
        else:
            return jsonify({"message": "Invalid user type"}), 400

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")  # Para debug
        return jsonify({"error": str(e)}), 500
    
# Ruta para obtener el PDF del pasaporte
@app.route('/passport-pdf/<file_id>', methods=['GET'])
def get_passport_pdf(file_id):
    try:
        file = fs.get(ObjectId(file_id))
        return file.read(), 200, {'Content-Type': 'application/pdf'}
    except Exception as e:
        print(f"Error retrieving file: {str(e)}")
        return jsonify({"error": "File not found"}), 404

# Ruta para iniciar sesión
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print(f"Login attempt for user: {data.get('username')}")  # Para debug
        
        username = data.get('username')
        password = data.get('password')

        # Hashear la contraseña ingresada por el usuario
        hashed_password = hash_password(password)

        # Buscar el usuario en ambas colecciones (empleados y administradores)
        user_empleados = mongo.db.empleados.find_one({'username': username, 'password': hashed_password})
        user_admin = mongo.db.administradores.find_one({'username': username, 'password': hashed_password})

        # Verificar si el usuario existe y la contraseña coincide
        if user_empleados:
            return jsonify({
                "message": "login success",
                "userType": "employee"  # Indicar que es un empleado
            })
        if user_admin:
            return jsonify({
                "message": "login success",
                "userType": "admin"  # Indicar que es un administrador
            })
        
        return jsonify({"message": "login failed"})
    except Exception as e:
        print(f"Login error: {str(e)}")  # Para debug
        return jsonify({"error": str(e)}), 500
    
# Ruta para obtener la información del usuario
@app.route('/user-info', methods=['GET'])
def user_info():
    try:
        # Obtener el nombre de usuario de la solicitud
        username = request.args.get('username')

        if not username:
            return jsonify({"error": "Username not provided"}), 400

        # Buscar el usuario en ambas colecciones (empleados y administradores)
        user_empleados = mongo.db.empleados.find_one({'username': username})
        user_admin = mongo.db.administradores.find_one({'username': username})

        if user_empleados:
            return jsonify({
                "userType": "employee",
                "userData": {
                    "name": user_empleados.get('name'),
                    "email": user_empleados.get('email'),
                    "phone": user_empleados.get('phone'),
                    "employeeNumber": user_empleados.get('employeeNumber')
                }
            })
        if user_admin:
            return jsonify({
                "userType": "admin",
                "userData": {
                    "name": user_admin.get('name'),
                    "email": user_admin.get('email'),
                    "phone": user_admin.get('phone')
                }
            })

        return jsonify({"message": "User not found"}), 404
    except Exception as e:
        print(f"Error fetching user info: {str(e)}")
        return jsonify({"error": str(e)}), 500
# Configuración de Flask-Mail para enviar correos
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Servidor SMTP de Gmail
app.config['MAIL_PORT'] = 587  # Puerto para TLS
app.config['MAIL_USE_TLS'] = True  # Usar TLS
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')  # Tu correo electrónico
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')  # Tu contraseña de aplicación
mail = Mail(app)

# Nueva colección para donantes
@app.route('/donors', methods=['GET'])
def get_donors():
    try:
        donors = list(mongo.db.donors.find({}, {'password': 0}))
        # Convertir ObjectId a string para JSON
        for donor in donors:
            donor['_id'] = str(donor['_id'])
        return jsonify(donors)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para registrar donante
@app.route('/register-donor', methods=['POST'])
def register_donor():
    try:
        data = request.get_json()
        
        # Verificar si el correo ya existe
        existing_donor = mongo.db.donors.find_one({'email': data.get('email')})
        if existing_donor:
            return jsonify({"message": "Donor with this email already exists"}), 400

        # Crear nuevo donante
        new_donor = {
            'donorType': data.get('donorType'),
            'sector': data.get('sector'),
            'name': data.get('name'),
            'phone': data.get('phone'),
            'email': data.get('email'),
            'address': data.get('address'),
            'socialMedia': data.get('socialMedia'),
            'observations': data.get('observations'),
            'createdAt': datetime.datetime.utcnow(),
            'interactions': [],
            'donations': []
        }

        result = mongo.db.donors.insert_one(new_donor)
        return jsonify({
            "message": "Donor registered successfully",
            "donorId": str(result.inserted_id)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/beneficiarios', methods=['GET', 'POST'])
def beneficiarios():
    if request.method == 'GET':
        # Obtener todos los beneficiarios y convertir ObjectId a string
        beneficiarios = list(mongo.db.beneficiarios.find({}))
        for b in beneficiarios:
            b['_id'] = str(b['_id'])
            # Convertir fecha a string para el frontend
            if 'fechaNacimiento' in b:
                b['fechaNacimiento'] = b['fechaNacimiento'].isoformat() if b['fechaNacimiento'] else None
            if 'fechaRegistro' in b:
                b['fechaRegistro'] = b['fechaRegistro'].isoformat() if b['fechaRegistro'] else None
        return jsonify(beneficiarios)
    
    if request.method == 'POST':
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['nombre', 'fechaNacimiento', 'lugarNacimiento', 'sexo', 'escolaridad', 'ocupacion', 'curp']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"El campo {field} es requerido"}), 400
        
        # Calcular la edad automáticamente
        fecha_nac = datetime.datetime.fromisoformat(data['fechaNacimiento'])
        hoy = datetime.datetime.now()
        edad = hoy.year - fecha_nac.year - ((hoy.month, hoy.day) < (fecha_nac.month, fecha_nac.day))
        
        # Crear el nuevo beneficiario con todos los campos
        new_beneficiario = {
            'nombre': data['nombre'],
            'fechaNacimiento': fecha_nac,
            'lugarNacimiento': data['lugarNacimiento'],
            'edad': edad,
            'sexo': data['sexo'],
            'escolaridad': data['escolaridad'],
            'ocupacion': data['ocupacion'],
            'curp': data['curp'],
            'nss': data.get('nss', ''),
            'afiliacion': data.get('afiliacion', ''),
            'tieneSeguro': data.get('tieneSeguro', 'no'),
            'companiaSeguros': data.get('companiaSeguros', ''),
            'estudioSocioeconomico': data.get('estudioSocioeconomico', 'no'),
            'rangoSocioeconomico': data.get('rangoSocioeconomico', ''),
            'servicio': data.get('servicio', ''),
            'fechaRegistro': datetime.datetime.utcnow()
        }
        
        # Insertar en la base de datos
        result = mongo.db.beneficiarios.insert_one(new_beneficiario)
        new_beneficiario['_id'] = str(result.inserted_id)
        
        # Convertir fechas a string para la respuesta
        new_beneficiario['fechaNacimiento'] = new_beneficiario['fechaNacimiento'].isoformat()
        new_beneficiario['fechaRegistro'] = new_beneficiario['fechaRegistro'].isoformat()
        
        return jsonify(new_beneficiario), 201

@app.route('/beneficiarios', methods=['GET', 'POST'])
def handle_beneficiarios():
    if request.method == 'GET':
        beneficiarios = list(mongo.db.beneficiarios.find({}))
        for b in beneficiarios:
            b['_id'] = str(b['_id'])
        return jsonify(beneficiarios)
    
    if request.method == 'POST':
        data = request.get_json()
        
        # Validar campos requeridos
        required_fields = ['nombre', 'fechaNacimiento', 'lugarNacimiento', 'sexo', 'escolaridad', 'ocupacion', 'curp']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"El campo {field} es requerido"}), 400
        
        nuevo_beneficiario = {
            'nombre': data['nombre'],
            'fechaNacimiento': data['fechaNacimiento'],
            'lugarNacimiento': data['lugarNacimiento'],
            'edad': data.get('edad', ''),
            'sexo': data['sexo'],
            'escolaridad': data['escolaridad'],
            'ocupacion': data['ocupacion'],
            'curp': data['curp'],
            'nss': data.get('nss', ''),
            'afiliacion': data.get('afiliacion', ''),
            'tieneSeguro': data.get('tieneSeguro', 'no'),
            'companiaSeguros': data.get('companiaSeguros', ''),
            'estudioSocioeconomico': data.get('estudioSocioeconomico', 'no'),
            'rangoSocioeconomico': data.get('rangoSocioeconomico', ''),
            'servicio': data.get('servicio', ''),
            'fechaRegistro': datetime.datetime.utcnow()
        }
        
        result = mongo.db.beneficiarios.insert_one(nuevo_beneficiario)
        nuevo_beneficiario['_id'] = str(result.inserted_id)
        
        return jsonify(nuevo_beneficiario), 201

# Nueva ruta para agregar responsable
@app.route('/beneficiarios/<beneficiario_id>/responsable', methods=['POST'])
def agregar_responsable(beneficiario_id):
    try:
        data = request.get_json()
        
        nuevo_responsable = {
            'nombre': data['nombre'],
            'parentesco': data['parentesco'],
            'telefono': data['telefono'],
            'email': data.get('email', ''),
            'direccion': data.get('direccion', ''),
            'fechaAgregado': datetime.datetime.utcnow()
        }
        
        # Actualizar el beneficiario para agregar el responsable
        result = mongo.db.beneficiarios.update_one(
            {'_id': ObjectId(beneficiario_id)},
            {'$push': {'responsables': nuevo_responsable}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Beneficiario no encontrado"}), 404
            
        return jsonify({"message": "Responsable agregado exitosamente", "responsable": nuevo_responsable}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Modificar el GET de beneficiarios para incluir responsables
@app.route('/beneficiarios', methods=['GET'])
def obtener_beneficiarios():
    beneficiarios = list(mongo.db.beneficiarios.find({}))
    for b in beneficiarios:
        b['_id'] = str(b['_id'])
        if 'fechaNacimiento' in b:
            b['fechaNacimiento'] = b['fechaNacimiento'].isoformat()
        if 'fechaRegistro' in b:
            b['fechaRegistro'] = b['fechaRegistro'].isoformat()
    return jsonify(beneficiarios)

# Ruta para obtener un beneficiario específico
@app.route('/beneficiarios/<beneficiario_id>', methods=['GET'])
def obtener_beneficiario(beneficiario_id):
    try:
        # Verificar si el ID es válido
        if not ObjectId.is_valid(beneficiario_id):
            return jsonify({"error": "ID inválido"}), 400

        beneficiario = mongo.db.beneficiarios.find_one({'_id': ObjectId(beneficiario_id)})
        
        if not beneficiario:
            return jsonify({"error": "Beneficiario no encontrado"}), 404

        # Convertir ObjectId y fechas
        beneficiario['_id'] = str(beneficiario['_id'])
        if 'fechaNacimiento' in beneficiario:
            beneficiario['fechaNacimiento'] = beneficiario['fechaNacimiento'].isoformat()
        if 'fechaRegistro' in beneficiario:
            beneficiario['fechaRegistro'] = beneficiario['fechaRegistro'].isoformat()
        if 'responsables' in beneficiario:
            for responsable in beneficiario['responsables']:
                if 'fechaAgregado' in responsable:
                    responsable['fechaAgregado'] = responsable['fechaAgregado'].isoformat()

        return jsonify(beneficiario)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para agregar interacción
@app.route('/add-interaction', methods=['POST'])
def add_interaction():
    try:
        data = request.get_json()
        
        interaction = {
            'type': data.get('type'),
            'date': datetime.datetime.utcnow(),
            'notes': data.get('notes'),
            'nextAction': data.get('nextAction'),
            'nextActionDate': data.get('nextActionDate')
        }

        mongo.db.donors.update_one(
            {'_id': ObjectId(data.get('donorId'))},
            {'$push': {'interactions': interaction}}
        )

        return jsonify({"message": "Interaction added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para agregar donación
@app.route('/add-donation', methods=['POST'])
def add_donation():
    try:
        data = request.get_json()
        
        donation = {
            'type': data.get('type'),
            'amount': data.get('amount'),
            'description': data.get('description'),
            'date': datetime.datetime.utcnow(),
            'receiptNumber': data.get('receiptNumber')
        }

        mongo.db.donors.update_one(
            {'_id': ObjectId(data.get('donorId'))},
            {'$push': {'donations': donation}}
        )

        return jsonify({"message": "Donation added successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta para enviar recordatorios
@app.route('/send-reminders', methods=['POST'])
def send_reminders():
    try:
        # Obtener interacciones que necesitan seguimiento
        now = datetime.datetime.utcnow()
        donors = mongo.db.donors.find({
            'interactions.nextActionDate': {'$lte': now}
        })

        for donor in donors:
            for interaction in donor.get('interactions', []):
                if interaction.get('nextActionDate') and interaction['nextActionDate'] <= now:
                    msg = Message(
                        subject=f"Recordatorio: {interaction['nextAction']}",
                        sender=os.getenv('MAIL_USERNAME'),
                        recipients=[donor['email']],
                        body=f"Estimado {donor['name']},\n\nEste es un recordatorio para {interaction['nextAction']}.\n\nSaludos,\nFundación México sin Sordera"
                    )
                    mail.send(msg)

        return jsonify({"message": "Reminders sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Nuevas rutas para el dashboard y calendario
@app.route('/dashboard-metrics', methods=['GET'])
def get_dashboard_metrics():
    try:
        # Obtener métricas de donantes
        total_donors = mongo.db.donors.count_documents({})
        
        # Donantes activos (con interacción en los últimos 6 meses)
        six_months_ago = datetime.datetime.utcnow() - datetime.timedelta(days=180)
        active_donors = mongo.db.donors.count_documents({
            '$or': [
                {'interactions.date': {'$gte': six_months_ago}},
                {'donations.date': {'$gte': six_months_ago}}
            ]
        })
        
        # Obtener total de donaciones
        pipeline = [
            {'$unwind': '$donations'},
            {'$group': {
                '_id': None,
                'totalAmount': {'$sum': '$donations.amount'}
            }}
        ]
        donations_result = list(mongo.db.donors.aggregate(pipeline))
        total_donations = donations_result[0]['totalAmount'] if donations_result else 0
        
        # Obtener últimas donaciones
        recent_donations = list(mongo.db.donors.aggregate([
            {'$unwind': '$donations'},
            {'$sort': {'donations.date': -1}},
            {'$limit': 5},
            {'$project': {
                'donorName': '$name',
                'amount': '$donations.amount',
                'date': '$donations.date'
            }}
        ]))
        
        return jsonify({
            'totalDonors': total_donors,
            'activeDonors': active_donors,
            'totalDonations': total_donations,
            'recentDonations': recent_donations
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Integración con Google Calendar
@app.route('/calendar-events', methods=['GET'])
def get_calendar_events():
    try:
        # Obtener eventos de la base de datos
        donors = mongo.db.donors.find({
            'interactions.nextActionDate': {'$exists': True}
        })
        
        events = []
        for donor in donors:
            for interaction in donor.get('interactions', []):
                if 'nextActionDate' in interaction:
                    events.append({
                        'title': f"{interaction['nextAction']} - {donor['name']}",
                        'start': interaction['nextActionDate'],
                        'end': interaction['nextActionDate'],
                        'allDay': True,
                        'resource': {
                            'donorId': str(donor['_id']),
                            'interactionId': str(interaction.get('_id', ''))
                        }
                    })
        
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Sincronización con Google Calendar
@app.route('/sync-with-google', methods=['POST'])
def sync_with_google():
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
        
        # Configuración de credenciales (ajustar según tu configuración)
        SCOPES = ['https://www.googleapis.com/auth/calendar']
        SERVICE_ACCOUNT_FILE = 'service-account.json'  # Archivo de credenciales
        
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        
        service = build('calendar', 'v3', credentials=creds)
        
        # Obtener eventos de la base de datos
        events = get_calendar_vents().json
        
        # Sincronizar con Google Calendar
        for event in events:
            google_event = {
                'summary': event['title'],
                'start': {'dateTime': event['start'].isoformat()},
                'end': {'dateTime': event['end'].isoformat()},
                'description': f"Donante: {event['resource']['donorId']}"
            }
            
            service.events().insert(
                calendarId='primary',
                body=google_event
            ).execute()
        
        return jsonify({'message': 'Sincronización con Google Calendar completada'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/events', methods=['GET', 'POST'])
def handle_events():
    if request.method == 'GET':
        events = list(mongo.db.events.find({}))
        for event in events:
            event['_id'] = str(event['_id'])
            # Convertir fechas string a objetos Date para el frontend
            event['start'] = event['start'].isoformat() if 'start' in event else None
            event['end'] = event['end'].isoformat() if 'end' in event else None
        return jsonify(events)
    
    if request.method == 'POST':
        data = request.get_json()
        new_event = {
            'title': data['title'],
            'start': datetime.datetime.fromisoformat(data['start']),
            'end': datetime.datetime.fromisoformat(data['end']),
            'desc': data.get('desc', ''),
            'created_at': datetime.datetime.utcnow()
        }
        result = mongo.db.events.insert_one(new_event)
        new_event['_id'] = str(result.inserted_id)
        # Convertir fechas a string para la respuesta
        new_event['start'] = new_event['start'].isoformat()
        new_event['end'] = new_event['end'].isoformat()
        return jsonify(new_event), 201

# Ruta para recuperar contraseña
@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        # Buscar el usuario en ambas colecciones (migrantes y empleados)
        user_migrantes = mongo.db.migrantes.find_one({'email': email})
        user_empleados = mongo.db.empleados.find_one({'email': email})

        if user_migrantes or user_empleados:
            # Generar un token único para restablecer la contraseña
            token = os.urandom(16).hex()  # Token aleatorio

            # Guardar el token en la base de datos (puedes usar una colección separada para tokens)
            mongo.db.tokens.insert_one({
                'email': email,
                'token': token,
                'expires': datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Expira en 1 hora
            })

            # Crear el enlace para restablecer la contraseña
            reset_link = f"http://localhost:3000/reset-password?token={token}"

            # Enviar el correo electrónico
            msg = Message(
                subject="Recuperación de contraseña",
                sender=os.getenv('MAIL_USERNAME'),
                recipients=[email],
                body=f"Haz clic en el siguiente enlace para restablecer tu contraseña: {reset_link}"
            )
            mail.send(msg)

            return jsonify({"message": "Se ha enviado un enlace para restablecer la contraseña a tu correo electrónico."})
        else:
            return jsonify({"message": "No existe ningún usuario con este correo electrónico."}), 404
    except Exception as e:
        print(f"Forgot password error: {str(e)}")  # Para debug
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)