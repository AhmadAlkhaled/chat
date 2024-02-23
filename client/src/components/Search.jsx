const Search = () => {
  return (
    <div className='relative'>
      <input
        className='w-full pr-10 pl-2 rounded-md p-1 outline-none border'
        type='text'
        placeholder='Search'
      />
      <i className='fa-solid fa-magnifying-glass absolute top-2 right-3 cursor-pointer'></i>
    </div>
  );
};

export default Search;
