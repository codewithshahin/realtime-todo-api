const addUser = (socket, arr) => {
  const newArr = [];
  arr.forEach((sk) => {
    if (sk.id === socket.id) {
      return;
    } else {
      arr.push(socket);
    }
  });
};

export { addUser };
