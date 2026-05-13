import { api } from "../../core/api.js"; 
import { showToast } from "../../core/utils.js";

export async function handleStartTask(taskId, onComplete) {
    try {
        await api.request(`/data/tasks/${taskId}/start`, {
            method: "PATCH"
        });
        showToast("Task started. Timer active.");
        
        const updatedTasks = await api.request("/data/tasks"); 
        if (onComplete) onComplete(updatedTasks);
    } catch (error) {
        showToast(`Error: ${error.message}`);
    }
}