import { Feedback } from "@prisma/client";
import prisma from "../../config/prisma";


const sendFeedback = async (id: string, payload: Feedback) => {
    // Check if the user exists
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new Error("User not found");
    }
    
    const feedback = await prisma.feedback.create({
        data: {
            userId: id,
            rating: payload.rating,
            appVersion: payload.appVersion,
            selectedOpinions: payload.selectedOpinions,
            otherOpinion: payload.otherOpinion,
            comment: payload.comment,
        },
        select: {
            id: true,
            userId: true,
            rating: true,
            appVersion: true,
            selectedOpinions: true,
            otherOpinion: true,
            comment: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            createdAt: true,
            updatedAt: true,
        },
    });

    return feedback;
};


export const FeedbackServices = {
    sendFeedback,
};
