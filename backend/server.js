const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'this-is-a-super-secret-key-for-jwt';

// --- DATABASE CONNECTION ---
const MONGO_URI = 'mongodb+srv://yatensingh0:ryphfN0iw2LeDOVJ@webme.lutpo4u.mongodb.net/cv-webpage-db?retryWrites=true&w=majority&appName=WEBME';
mongoose.connect(MONGO_URI).then(() => console.log('Successfully connected to MongoDB Atlas!')).catch(err => console.error('MongoDB Connection Error:', err));

// --- GOOGLE AI SETUP ---
const GEMINI_API_KEY = 'AIzaSyDsj1P70t792QDe1LK_BTCqJYMM0WN60MM';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// --- USER SCHEMA AND MODEL ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String }, // Naya field
    dob: { type: Date } // Naya field
});
const User = mongoose.model('User', userSchema);

// Middlewares
app.use(cors());
app.use(express.json());

// --- USER AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ name, email, phone, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials. User not found.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials. Wrong password.' });
        }
        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.status(200).json({ message: 'Login successful!', token: token });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- GET USER PROFILE API (Naya Endpoint) ---
app.get('/api/profile', async (req, res) => {
    try {
        const token = req.headers['x-auth-token'];
        if (!token) return res.status(401).json({ message: 'No token, authorization denied.' });

        const decoded = jwt.verify(token, JWT_SECRET);
        // Password ko chhodkar baaki sab kuch bhejein
        const user = await User.findById(decoded.user.id).select('-password'); 

        if (!user) return res.status(404).json({ message: 'User not found.' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- PROFILE UPDATE API ---
app.put('/api/profile', async (req, res) => {
    try {
        // Token se user ID nikalein (authentication)
        const token = req.headers['x-auth-token'];
        if (!token) return res.status(401).json({ message: 'No token, authorization denied.' });
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.user.id;

        const { username, dob, password } = req.body;
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        // User ki details update karein
        if (username) user.name = username; // Hum 'name' field ko update kar rahe hain
        if (dob) user.dob = dob;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.status(200).json({ message: 'Profile updated successfully!' });

    } catch (error) {
        console.error('Profile update error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token is not valid.' });
        }
        res.status(500).json({ message: 'Server error during profile update.' });
    }
});

// --- CHATBOT API ROUTE ---
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const prompt = `
            You are Ankit Kumar Meena's friendly and professional AI assistant for his portfolio website.
            Your goal is to help visitors by providing information about Ankit and his services.
            Here is some information about Ankit and his website. Use this to answer questions:
            ---
            Ankit's Information:
            - Name: Ankit Kumar Meena
            - Location: New Delhi, India
            - Email: ankitkumar956021@gmail.com
            - Phone: +91 9560214284
            - LinkedIn: https://www.linkedin.com/in/ankit950
            - Skills: HTML, CSS, JavaScript, TypeScript, Node.js, Express, MongoDB, React.
            Website Information:
            - The website is a personal portfolio for Ankit Kumar Meena.
            - It has sections for Home, About, Services, and Contact.
            - In the 'Store' section (under Services), Ankit sells products. The first product is a "Custom Portfolio Website" for ₹1000.
            - The website is fully responsive and features modern animations.
            Your Behavior:
            - Be friendly, helpful, and slightly formal.
            - If you don't know the answer, say "I don't have that information, but you can contact Ankit directly via the contact form."
            - Do not reveal that you are a Google Gemini model. Refer to yourself as "Ankit's AI assistant".
            - Keep answers concise.
            ---
            Now, please answer the following user's question: "${message}"
        `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ reply: text });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ reply: 'Sorry, I am having trouble connecting to my brain right now. Please try again later.' });
    }
});

// Server ko start karein
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});