import express from "express";
import io from "socket.io";
import { DialogsModel, MessagesModel } from "../models";

class DialogsController {
  io: io.Socket;
  constructor(io: io.Socket) {
    this.io = io;
  }

  index = (req: any, res: express.Response): void => {
    const userId: String = req.user._id;

    DialogsModel.find()
      .or([{ author: userId }, { partner: userId }])
      .populate(["autor", "partner"])
      .populate({
        path: "lastMessage",
        populate: {
          path: "user",
        },
      })
      .exec((err, dialogs) => {
        if (err) {
          return res.status(404).json({
            message: "Dialogs not found",
          });
        }
        return res.json(dialogs);
      });
  };
  create = (req: any, res: express.Response) => {
    const postData = {
      autor: req.user._id,
      partner: req.body.partner,
    };
    const dialogs = new DialogsModel(postData);
    dialogs
      .save()
      .then((dialogObj: any) => {
        const message = new MessagesModel({
          text: req.body.text,
          user: req.body.autor,
          dialog: dialogObj._id,
        });
        message
          .save()
          .then(() => {
            dialogObj.lastMessage = message._id;
            dialogObj.save().then(() => {
              res.json(dialogObj);
              this.io.emit("SERVER:DIALOG_CREATED", {
                ...postData,
                dialog: dialogObj,
              });
            });
          })
          .catch((reason: any) => res.json(reason));
      })
      .catch((reason: any) => res.json(reason));
  };
  delete = (req: express.Request, res: express.Response) => {
    const id: string = req.params.id;
    DialogsModel.findByIdAndRemove(id, (err: any) => {
      if (err) {
        return res.status(404).json({
          message: "Dialog not found",
        });
      }
      res.json({
        message: `Dialog deleted`,
      });
    });
  };
}

export default DialogsController;
