import request from "supertest";
import { app } from "../../app";

it("returns a 200 on successful signin", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password",
        })
        .expect(201);

    await request(app)
        .post("/api/users/signin")
        .send({
            email: "test@test.com",
            password: "password",
        })
        .expect(200);
});

it("fails when a email that does not exist is supplied", async () => {
    await request(app)
        .post("/api/users/signin")
        .send({
            email: "test@test.com",
            password: "password123",
        })
        .expect(400);
});

it("fails when a incorrect password is supplied", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password",
        })
        .expect(201);

    await request(app)
        .post("/api/users/signup")
        .send({
            email: "bala",
            password: "pas",
        })
        .expect(400);
});

it("response with a cookie when given valid credentials", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password",
        })
        .expect(201);

    const response = await request(app)
        .post("/api/users/signin")
        .send({
            email: "test@test.com",
            password: "password",
        })
        .expect(200);

    expect(response.get("Set-Cookie")).toBeDefined();
});
