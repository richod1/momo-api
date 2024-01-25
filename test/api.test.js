const axios = require("axios");
const supertest = require("supertest");
const express = require("express");
const app = require("../api"); 

jest.mock("axios");

describe("GET /api", () => {
  it("should respond with 'Momo api'", async () => {
    const response = await supertest(app).get("/api");
    expect(response.text).toBe("Momo api");
    expect(response.status).toBe(200);
  });
});

describe("POST /get-momo-token", () => {
  it("should respond with a valid momoToken", async () => {
    axios.post.mockResolvedValue({
      data: { access_token: "mockedToken" },
    });

    const response = await supertest(app)
      .post("/get-momo-token")
      .send({ apiKey: "mockedApiKey", subscriptionKey: "mockedSubscriptionKey" });

    expect(response.body).toHaveProperty("momoToken", "mockedToken");
    expect(response.status).toBe(200);
  });

  it("should handle token generation error", async () => {
    axios.post.mockRejectedValue(new Error("mocked error"));

    const response = await supertest(app)
      .post("/get-momo-token")
      .send({ apiKey: "mockedApiKey", subscriptionKey: "mockedSubscriptionKey" });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("err", "Error occured in token generation");
  });
});

describe("POST /request-to-pay", () => {
  it("should respond with momoResponse on successful payment request", async () => {
    axios.post.mockResolvedValue({
      data: { mockedPaymentResponse: "success" },
    });


    const response = await supertest(app)
      .post("/request-to-pay")
      .send({ total: 100, phone: "0209792039", currency: "EUR" });

    expect(response.body).toHaveProperty("momoResponse", { mockedPaymentResponse: "success" });
    expect(response.status).toBe(201);
  });

  it("should handle payment request error", async () => {
    axios.post.mockRejectedValue(new Error("mocked error"));


    const response = await supertest(app)
      .post("/request-to-pay")
      .send({ total: 100, phone: "0209792039", currency: "EUR" });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("err", "An error occured at payment request route");
  });

  it("should handle missing momoToken", async () => {
    // Simulating momoToken not available

    const response = await supertest(app)
      .post("/request-to-pay")
      .send({ total: 100, phone: "0209792039", currency: "EUR" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Momo token is not available");
  });
});
