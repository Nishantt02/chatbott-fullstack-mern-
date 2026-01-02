
import express from "express";
import { isAuth } from "../Middlewares/IsAuth.js";
import {
  addConversation,
  createChat,
  deleteChat,
  getAllChats,
  getConversation,
} from '../Controllers/ChatContollers.js'

const router = express.Router();

router.post("/new", isAuth, createChat);
router.get("/all", isAuth, getAllChats);
router.post("/add/:id", isAuth, addConversation);
router.get("/:id", isAuth, getConversation);
router.delete("/:id", isAuth, deleteChat);

export default router;