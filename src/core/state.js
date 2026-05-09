/**
 * src/core/state.js
 * Global State Management for Project Kafka
 */

const STORAGE_KEY = 'kafka_hotel_data';

export const state = {
    // Save data to localStorage
    saveHotelData(data) {
        const currentData = this.getHotelData();
        const updatedData = { ...currentData, ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
        console.log('State Updated:', updatedData);
    },

    // Retrieve data from localStorage
    getHotelData() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    }
};