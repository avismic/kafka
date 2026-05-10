//src/dashboard/helpers/handle-complete-task.js

import { api } from "../../core/api.js";
import { showToast } from "../../core/utils.js";

export async function handleCompleteTask(taskId, onComplete) {
    try {
        // 1. Tell the database this task is finished
        await api.request(`/data/tasks/${taskId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: 'completed' })
        });

        showToast("Task archived successfully.");

        // 2. Fetch the freshest list from the server to ensure sync
        const updatedTasks = await api.request("/data/tasks");
        
        if (onComplete) onComplete(updatedTasks);
    } catch (error) {
        console.error("Task completion failed:", error);
        showToast(`Error: ${error.message}`);
    }
}