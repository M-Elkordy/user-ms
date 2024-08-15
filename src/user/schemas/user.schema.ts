import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, ObjectId } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ required: true })
    email: string;
    
    @Prop({ required: true })
    fullName: string;
    
    @Prop({ required: true })
    phoneNumber: string;
    
    @Prop({ required: true })
    userName: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    expireTokens: string[];

    @Prop({ type: mongoose.Types.ObjectId })
    merchantId: ObjectId;

    @Prop({ type: [{ type: mongoose.Types.ObjectId }] })
    payerId: ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);