import { model, Mongoose, Schema } from 'mongoose';

// Mongoose.set('strictQuery', false);

interface iNote {
    title: String;
    description: String;
    userId: Schema.Types.ObjectId;
    fileLoc:[{filename:string,path:string,originalname:string}]
}

const NoteSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        require: true
    },
    fileLoc: [{
        type: Object
    }]
}, { timestamps: true });

export const NOTES = model<iNote>("Note", NoteSchema);
