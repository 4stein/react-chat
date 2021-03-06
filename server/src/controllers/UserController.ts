import express from "express";
import bcrypt from "bcrypt";
import { validationResult, Result, ValidationError } from "express-validator";
import io from "socket.io";

import { UserModel } from "../models";
import { createJWTToken } from "../utils";
import { IUser } from "../types";

class UserController {
  io: io.Socket;
  constructor(io: io.Socket) {
    this.io = io;
  }
  index = (req: express.Request, res: express.Response) => {
    const id: string = req.params.id;
    UserModel.findById(id, (err: any, user: any) => {
      if (err) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      res.json(user);
    });
  };
  me = (req: any, res: express.Response) => {
    const id: string = req.user._id;
    UserModel.findById(id, (err: any, user: any) => {
      if (err) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      res.json(user);
    });
  };

  findUsers = (req: any, res: express.Response): void => {
    const query: string = req.query.query;
    UserModel.find()
      .or([
        { fullname: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
      ])
      .then((users: IUser[]) => res.json(users))
      .catch((err: any) => {
        return res.status(404).json({
          status: "error",
          message: err,
        });
      });
  };

  create = (req: express.Request, res: express.Response) => {
    const postData = {
      email: req.body.email,
      fullname: req.body.fullname,
      password: req.body.password2,
    };
    const user = new UserModel(postData);
    user
      .save()
      .then((obj: any) => {
        res.json(obj);
      })
      .catch((reason: any) => res.json(reason));
  };
  delete = (req: express.Request, res: express.Response) => {
    const id: string = req.params.id;
    UserModel.findByIdAndRemove(id, (err: any, user: any) => {
      if (err) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      res.json({
        message: `User ${user.fullname} deleted`,
      });
    });
  };
  // verify = (req: any, res: express.Response) => {
  //   const hash: string = req.query.hash;
  //   if (!hash) {
  //     return res.status(422).json({
  //       message: "invalid hash",
  //     });
  //   }
  //   UserModel.find({ confirm_hash: hash }, (err: any, user: any) => {
  //     if (err || !user) {
  //       return res.status(404).json({
  //         message: "User not found",
  //       });
  //     }
  //     res.json({
  //       status: "seccess",
  //       message: "Account successfully confirmedly",
  //     });
  //   });
  // };
  login = (req: express.Request, res: express.Response): void => {
    const postData: { email: string; password: string } = {
      email: req.body.email,
      password: req.body.password,
    };

    const errors: Result<ValidationError> = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    } else {
      UserModel.findOne({ email: postData.email }, (err, user: IUser) => {
        if (err || !user) {
          return res.status(404).json({
            message: "User not found",
          });
        }
        if (bcrypt.compareSync(postData.password, user.password)) {
          const token = createJWTToken(user);
          res.json({
            status: "success",
            token,
          });
        } else {
          res.status(403).json({
            status: "error",
            message: "Incorrect password or email",
          });
        }
      });
    }
  };
}

export default UserController;
