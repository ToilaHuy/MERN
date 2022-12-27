const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const getAllUser = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({
            message: 'No users found',
        });
    }
    res.json(users);
});

const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body;

    //confirm data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'all fields are required' });
    }
    //check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec();
    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' });
    }
    //Hash password
    const hashedPwd = await bcrypt.hash(password, 10); // salt round
    const userObject = { username, password: hashedPwd, roles };
    //create and store new user
    const user = await User.create(userObject);
    if (user) {
        //create
        res.status(201).json({ messages: `New user ${username} created` });
    } else {
        res.status(400).json({ messages: 'invalid user data received' });
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body;
    //confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' });
    }
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }
    //check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec();
    // Allow updates to the original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate username' });
    }
    user.username = username;
    user.roles = roles;
    user.active = active;
    if (password) {
        //hashedPwd
        user.password = await bcrypt.hash(password, 10);
    }
    const updateUser = await user.save();
    res.json({ message: `${updateUser.username} updated` });
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(404).json({ message: 'User Id required' });
    }
    const note = await Note.findOne({ user: id }).lean().exec();
    if (note) {
        return res.status(400).json({ message: 'User has assigned notes' });
    }
    const user = await User.findById(id).exec();
    if (!user) {
        return res.status(400).json({ message: 'User not found ' });
    }
    const result = await user.deleteOne();
    const reply = `Username ${result.username} with ID ${result._id} deleted`;
    res.json(reply);
});

module.exports = {
    getAllUser,
    createNewUser,
    updateUser,
    deleteUser,
};
