package com.munna.assistai

import org.junit.Assert.assertTrue
import org.junit.Test

class AssistantLogicTest {
    @Test fun blankInputPromptsUser() {
        assertTrue(AssistantLogic.localReply("  ").contains("প্রশ্নটি লিখুন"))
    }

    @Test fun greetingReturnsWelcome() {
        assertTrue(AssistantLogic.localReply("hello").contains("স্বাগতম"))
    }

    @Test fun offlineAnswerIsHonestAboutLimitations() {
        assertTrue(AssistantLogic.localReply("offline mode").contains("Live AI সংযুক্ত নেই") ||
            AssistantLogic.localReply("offline mode").contains("পূর্ণ AI উত্তর"))
    }

    @Test fun unknownQuestionDoesNotPretendToBeLiveAi() {
        assertTrue(AssistantLogic.localReply("Explain quantum field theory").contains("Live AI সংযুক্ত নেই"))
    }

    @Test fun offlineCreationIsClearlyASample() {
        assertTrue(AssistantLogic.makeCreation("কবিতা", "বৃষ্টি").contains("offline sample"))
    }

    @Test fun unknownCreationKindStillReturnsHelpfulText() {
        assertTrue(AssistantLogic.makeCreation("অন্য", "test").contains("AI backend"))
    }
}
