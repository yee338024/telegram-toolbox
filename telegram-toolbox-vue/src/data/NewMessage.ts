import {Chat, Supergroup, BasicGroup, Message, User} from "tdlib-types";

export interface NewMessage extends Message{
  group?: BasicGroup | Supergroup
  sender?: User
  chat?: Chat
}
