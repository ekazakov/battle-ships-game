import { BehaviorSubject } from "rxjs";

export function createApiObservable(options = {}) {
  const subject = new BehaviorSubject({
    status: "idle",
    value: null,
    error: null
  });

  async function sendRequest(url, requestOptions = {}) {
    subject.next({ ...subject.getValue(), status: "loading" });
    const response = await fetch(url, { ...options, ...requestOptions });
    const data = await response.json();

    if (response.ok) {
      subject.next({ status: "success", value: data, error: null });
    } else {
      subject.next({ status: "failure", value: null, error: data });
    }
  }

  return {
    sendRequest,
    observable: subject.asObservable()
  };
}