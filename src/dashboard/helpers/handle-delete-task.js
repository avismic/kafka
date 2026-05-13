import { api } from "../../core/api.js";
import { showToast } from "../../core/utils.js";

export async function handleDeleteTask(taskId, onComplete) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
        await api.request(`/data/tasks/${taskId}`, {
            method: "DELETE"
        });
        showToast("Task deleted.");
        
        const updatedTasks = await api.request("/data/tasks");
        if (onComplete) onComplete(updatedTasks);
    } catch (error) {
        showToast(`Error: ${error.message}`);
    }
}