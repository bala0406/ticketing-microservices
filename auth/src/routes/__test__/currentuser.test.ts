import request from "supertest";
import { app } from "../../app";
import { signup } from "../../test/AuthHelper";

it("response with details about the current user", async () => {
    const cookie = await signup();

    const response = await request(app)
        .get("/api/users/currentuser")
        .set("Cookie", cookie)
        .send()
        .expect(200);
    expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("responds with null if not authenticated", async () => {
    const response = await request(app)
        .get("/api/users/currentuser")
        .send()
        .expect(200);

    expect(response.body.currentUSer).toEqual(null);
});
