import axios from "axios";

export function getApiError(error: unknown): string {

    if (axios.isAxiosError(error)) {

        if (typeof error.response?.data === "string") {
            return error.response.data;
        }

        if (error.response?.data?.message) {
            return error.response.data.message;
        }

        if (error.response?.data?.title) {
            return error.response.data.title;
        }

        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Ha ocurrido un error inesperado.";
}