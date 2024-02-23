const AlertForChanges = ({ callBack, deleteFunc, user }) => {
  const { firstName, lastName } = user;

  return (
    <div className='w-full h-screen top-0 left-0 flex items-center justify-center z-10 fixed bg-[#000000b0] backdrop-blur-sm cursor-default'>
      <div className='top-20 border border-darkGreen rounded-md p-3  backdrop-blur-md bg-bgLight'>
        <div className='flex items-center gap-2 justify-center mb-4'>
          <i className='fa-solid fa-circle-exclamation'></i>
          <h3 className='text-lg font-medium'>
            {`Are you sure you want to unfriend ${
              firstName[0].toUpperCase() + firstName.slice(1)
            } ${lastName[0].toUpperCase() + lastName.slice(1)} ?`}
          </h3>
        </div>

        <div className='flex justify-center items-center gap-3'>
          <button
            className='border rounded-md w-16 py-1 bg-textGreen text-textDark hover:bg-bgDark hover:border-textGreen hover:text-textWhite'
            onClick={deleteFunc}
          >
            Yes
          </button>

          <button
            className='rounded-md w-16 py-1 bg-bgDark hover:border hover:border-textGreen hover:text-textWhite'
            onClick={callBack}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertForChanges;
