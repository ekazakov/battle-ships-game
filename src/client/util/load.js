import { isEmptyValue, useObservable } from "../hooks/use-observable";

const errorStyles = { color: "red" };

function LoadingContainer({
  observable,
  render,
  renderIdle,
  renderLoading,
  renderError
}) {
  const lastUpdate = useObservable(observable);
  // console.log("lastUpdate:", lastUpdate);
  if (isEmptyValue(lastUpdate) || lastUpdate.status === "idle") {
    return renderIdle ? <>{renderIdle()}</> : <>idle</>;
  }

  if (lastUpdate.status === "loading") {
    return renderLoading ? <>{renderLoading()}</> : <div>Loading ...</div>;
  }

  if (lastUpdate.status === "failure") {
    if (renderError) {
      return <>renderError(lastUpdate.error)</>;
    }

    return <div style={errorStyles}>{lastUpdate.error.message}</div>;
  }

  return render ? (
    <>{render(lastUpdate.value)}</>
  ) : (
    <div>{JSON.stringify(lastUpdate.value)}</div>
  );
}

export function load(observable, options = {}) {
  return <LoadingContainer observable={observable} {...options} />;
}
