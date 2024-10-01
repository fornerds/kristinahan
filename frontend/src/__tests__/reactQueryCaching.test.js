// src/__tests__/reactQueryCaching.test.js

import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { useAuthors, useEventDetails, useOrders } from "../api/hooks";
import * as api from "../api/api";

// API 호출을 모킹합니다.
jest.mock("../api/api");

// 테스트용 컴포넌트를 만듭니다.
const TestComponent = ({ hook, params }) => {
  const query = hook(params);
  return <div>{query.isLoading ? "Loading" : "Loaded"}</div>;
};

describe("React Query Caching Tests", () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    queryClient.clear();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const renderWithClient = (ui) => {
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
  };

  test("useAuthors caching", async () => {
    api.getAuthors.mockResolvedValue({ data: [{ id: 1, name: "Author 1" }] });

    const { rerender } = renderWithClient(<TestComponent hook={useAuthors} />);

    await screen.findByText("Loaded");
    expect(api.getAuthors).toHaveBeenCalledTimes(1);

    rerender(
      <QueryClientProvider client={queryClient}>
        <TestComponent hook={useAuthors} />
      </QueryClientProvider>
    );

    await screen.findByText("Loaded");
    expect(api.getAuthors).toHaveBeenCalledTimes(1); // 캐시로 인해 API 호출 횟수가 증가하지 않아야 함
  });

  test("useEventDetails caching", async () => {
    api.getEventDetails.mockResolvedValue({ data: { id: 1, name: "Event 1" } });

    const { rerender } = renderWithClient(
      <TestComponent hook={useEventDetails} params={1} />
    );

    await screen.findByText("Loaded");
    expect(api.getEventDetails).toHaveBeenCalledTimes(1);

    rerender(
      <QueryClientProvider client={queryClient}>
        <TestComponent hook={useEventDetails} params={1} />
      </QueryClientProvider>
    );

    await screen.findByText("Loaded");
    expect(api.getEventDetails).toHaveBeenCalledTimes(1); // 캐시로 인해 API 호출 횟수가 증가하지 않아야 함
  });

  test("useOrders caching with same parameters", async () => {
    api.getOrders.mockResolvedValue({ data: [{ id: 1, status: "pending" }] });

    const params = { page: 1, limit: 10 };
    const { rerender } = renderWithClient(
      <TestComponent hook={useOrders} params={params} />
    );

    await screen.findByText("Loaded");
    expect(api.getOrders).toHaveBeenCalledTimes(1);

    rerender(
      <QueryClientProvider client={queryClient}>
        <TestComponent hook={useOrders} params={params} />
      </QueryClientProvider>
    );

    await screen.findByText("Loaded");
    expect(api.getOrders).toHaveBeenCalledTimes(1); // 캐시로 인해 API 호출 횟수가 증가하지 않아야 함
  });
});

afterAll(() => {
  jest.useRealTimers();
  jest.clearAllTimers();
});
