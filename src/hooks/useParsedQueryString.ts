import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { parse, ParsedQs } from 'qs'

export default function useParsedQueryString(): ParsedQs {
  const location = useLocation()
  const search = location.search
  console.log(location)
  return useMemo(
    () => (search && search.length > 1 ? parse(search, { parseArrays: false, ignoreQueryPrefix: true }) : {}),
    [search],
  )
}
