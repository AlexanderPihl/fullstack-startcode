import express from "express";
import {Router} from "express"
const router = Router();
router.use(express.json());

import facade from "../facade/DummyDB-Facade";
import { IFriend } from '../interfaces/IFriend';
const Joi = require('joi');

import authMiddleware from "../middleware/basic-auth"
//router.use(authMiddleware);

import {ApiError} from "../errors/apiError"


router.get("/all", async (req, res) => {
    const friends = await facade.getAllFriends();
    const firendsDTO = friends.map(f => {
        const {firstName, lastName, email} = f; //defining the DTO values
        return {firstName, lastName, email}     //setting values til values in mapped friend (firstName: firstName shortcut)
    })
    res.json(firendsDTO);
});

router.get("/:email", async (req, res, next) => {
    const userId = req.params.userid;
    try {
      const friend = await facade.getFriend(userId);
      if (friend == null) {
        throw new ApiError("user not found", 404)
      }
      const { firstName, lastName, email } = friend;
      const friendDTO = { firstName, lastName, email }
      res.json(friendDTO);
    } catch (err) {
      next(err)
    }
  })
  

router.post("/", async (req, res) => {
    const friends = await facade.getAllFriends();
   
    const { error } = validateFriend(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const friend = {
        id: "id" + (friends.length + 1),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    };
    const f = await facade.addFriend(friend);
    res.json(f);
});

router.put("/:id", async (req, res) => {
    const friend = await facade.updateFriend(req.params.id);
    if (!friend) return res.status(404).send('The friend with the given ID was not found');

    const { error } = validateFriend(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    friend.firstName = req.body.firstName;
    friend.lastName = req.body.lastName;
    friend.email = req.body.email;
    friend.password = req.body.password;
    res.send(friend);
});

//### Lars' version fra video med dto, next og credentials ###
// fanger kun egne credentials og kan ikke søge på andres. Opfylder OWASP 5 broken authentication
router.put("/me", async (req: any, res, next) => {
    const userID = req.credentials.userName;
    const friend = await facade.getFriend(userID);
    if (friend == null){
        return next(new Error("user not found"))
    }
    const {firstName, lastName, email} = friend;
    const friendDTO = {firstName, lastName, email}
    res.json(friendDTO);
});
//###-----------------------------------------------------###//

router.delete("/delete/:email", async (req, res) => {
    const friends = await facade.getAllFriends();
    const friend = await facade.deleteFriend(req.params.email);
    if (!friend) return res.status(404).send('The friend with the given EMAIL was not found');

    const index = friends.indexOf(friend);
    friends.splice(index, 1);

    res.json(friend);
});

// For validating POST and PUT
function validateFriend(friend: IFriend) {
    const schema = {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email({ minDomainAtoms: 2 }).required(),
        password: Joi.string().min(6).required()
    };

    return Joi.validate(friend, schema);
}

export default router;