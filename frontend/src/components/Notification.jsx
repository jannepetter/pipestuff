const Notification = ({ errorMsg, message }) => {
  if (message === null && errorMsg === null) {
    return null;
  }

  if (errorMsg && message === null) {
    return <div className="error">{errorMsg}</div>;
  }

  if (errorMsg === null && message) {
    return <div className="success">{message}</div>;
  }

  return (
    <>
      <div className="success">{message}</div>
      <div className="error">{errorMsg}</div>
    </>
  );
};

export default Notification;
