/* istanbul ignore file */
import React, {useContext, useState} from 'react';
import axios from 'axios'
import Options from '../components/Options'
import Weather from '../components/Weather'


const Search = ({}) => {
	const apiToken = "3f71d5kylylwplhj7wu5ikwa4yds3dlj"
	const accountId = "IG3CBP2Q"
	// const temp = results.temp
	// const month = 6
	const [results, setResults] = useState()
	const [formSubmitted , setFormSubmitted]=useState(false)
	const [loading , setLoading]=useState(true)
	console.log(formSubmitted)

	const getAverage = (array) => array.reduce((a, b) => a + b) / array.length;
	
	async function getResults(e){
		e.preventDefault()
		setFormSubmitted(true)
		const tagLabels = {"art": "subtype-Art_museums", "beaches": "beaches", "cuisine": "cuisine", "golf": "golf", "museums":"museums", "skiing": "poitype-Ski_area", "hiking": "hiking", "nightlife": "nightlife"}
		const chosenTags = []
		const chosenTagsUrl = []
		const chosenScores = []
		const form = document.getElementById("option-form")
		const numberOfInputs = form.getElementsByTagName('input').length-1
		// iterate through checkboxes & sliders
		for(let x=0; x<numberOfInputs; x++){
			if (e.target[x].type==="checkbox"){
				if(e.target[x].checked){
				// if checkbox is checked, add tag and minimum-score to list, ready for fetch url
				chosenTags.push(tagLabels[e.target[x].name])
				chosenTagsUrl.push(`child_tag_labels=${tagLabels[e.target[x].name]}`)
				chosenScores.push(`${tagLabels[e.target[x].name]}_score=>${e.target[x+1].value}`)
				}
			}
		}
		const joinedTags=chosenTagsUrl.join("&")
		const joinedScores=chosenScores.join("&")
		const fetchedData = await fetchResults(joinedTags,joinedScores,chosenTags)

		// separate call for hiking to include national parks
		if(joinedTags.includes("hiking")){
			const nationalParks = await axios.get(`https://www.triposo.com/api/20220104/location.json?${joinedTags}&${joinedScores}&type=national_park&order_by=-score&account=${accountId}&token=${apiToken}`)
			fetchedData.data.results = fetchedData.data.results.concat(nationalParks.data.results)
		}
		
		// calculate average score for chosen options
		for(let x in fetchedData.data.results){
			const metricScores = []
			for(let y in chosenTags){
				// console.log(fetchedData.data.results[x][`${chosenTags[y]}_score`])
				metricScores.push(fetchedData.data.results[x][`${chosenTags[y]}_score`])
			}
			fetchedData.data.results[x].averageMetricScore = getAverage(metricScores)
		}
		fetchedData.data.results.sort((a, b) => (a.averageMetricScore > b.averageMetricScore) ? -1 : 1)
		// fetchedData.results.minimumTemp = e.target.
		// set results to the top 10 found results
		setResults(fetchedData.data.results.slice(0,10))
		// if(temp){
		// 	fetchedData.data.results.push({'minimumTemp': temp})
		// }
		setResults(fetchedData.data.results.slice(0,10))
		// console.log(fetchedData.data.results)
		setLoading(false)
	}

	async function fetchResults(joinedTags,joinedScores,chosenTags){
		if(chosenTags.length === 1){
			let fetchedData = await axios.get(`https://www.triposo.com/api/20220104/location.json?${joinedTags}&${joinedScores}&type=city&order_by=-${chosenTags[0]}_score&account=${accountId}&token=${apiToken}`)
			return fetchedData
		}
		else{
			let fetchedData = await axios.get(`https://www.triposo.com/api/20220104/location.json?${joinedTags}&${joinedScores}&type=city&order_by=-score&account=${accountId}&token=${apiToken}`)
			return fetchedData
		}
	}

	function handleClick(location){
		// send user to details page
		// setPlaceData(location)
	}

	function checkDataExists(){
		if(formSubmitted && results){
			if(loading){
				return 	<div class="flex-container">
							<div className="loading-div">
								<h3 className="loading-message">Loading...</h3>
									<div class="loader"></div>
							</div>
						</div>
			}
			else{
				if(results.length>0){
					return <Weather locations={results} handleClick={handleClick}/>
				}
				else{
					return <h3>No locations found with those criteria</h3>
				}
			}
		}
		else if(formSubmitted && !results){
			if(loading){
				return 	<div class="flex-container">
							<div className="loading-div">
								<h3 className="loading-message">Loading...</h3>
								<div class="loader"></div>
							</div>
						</div>
			}
			else{
				return <h3>No locations found with those criteria</h3>
			}
		}
		else if(!formSubmitted){
			return <></>
		}
	}

	return (
		<>
		<div>
			<Options getResults={getResults}/>
			{checkDataExists()}
		</div>
		{/* <div class="flex-container">
							<div className="loading-div">
								<h3 className="loading-message">Loading...</h3>
								<div class="loader"></div>
							</div>
						</div> */}
		</>
	)
}

export default Search