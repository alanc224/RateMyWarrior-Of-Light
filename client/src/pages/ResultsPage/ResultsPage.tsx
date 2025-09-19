import { useParams } from 'react-router-dom'
function ResultsPage () {
    const params = useParams();
    return (
        <>
            <h1>Results Page</h1>
            <p>for {params.category}</p>
            <p>searched: {params.query}</p>
        </>
    ) 
}

export default ResultsPage;