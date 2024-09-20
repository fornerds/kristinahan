import { http, HttpResponse } from "msw";
import event from "./dummy.json";

export const handlers = [
    http.get("http://localhost:3000/event", () => {
        console.log("MSW intercepted /event request");
        return HttpResponse.json(event, { status: 200 });
    }),
];