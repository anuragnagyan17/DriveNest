import { useLocation } from "react-router-dom"

const PageWrapper = ({ children }) => {
  const { pathname } = useLocation()

  return (
    <div key={pathname} className="page-animate">
      {children}
    </div>
  )
}

export default PageWrapper
