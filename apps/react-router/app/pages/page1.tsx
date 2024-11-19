import { Link } from "react-router";

const page1 = () => {
  return (
    <>
      <h1>Page 1</h1>
      <Link to={"/"}>Navigate to Home Page</Link>
    </>
  );
};
export default page1;
