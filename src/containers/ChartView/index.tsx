import { useState, useEffect, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from 'redux/hooks';
import { selectChartData, selectChartType } from 'redux/ChartView/selectors';
import { setChartType, ChartType } from 'redux/ChartView/slice';
import { selectSelectedCountryInSideBar } from 'redux/App/selectors';
import Loader from 'components/Loader';
import Typography from '@mui/material/Typography';

import { ChartContainer } from './styled';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import BarChart from './BarChart';
import CumulativeChart from './CumulativeChart';
import { getCumulativeChartData } from 'utils/helperFunctions';

const ChartView = () => {
    const dispatch = useAppDispatch();

    const chartData = useAppSelector(selectChartData);
    const selectedCountryInSidebar = useAppSelector(
        selectSelectedCountryInSideBar,
    );
    const chartType = useAppSelector(selectChartType);
    const [isLoading, setIsLoading] = useState(true);

    const selectedCountry = selectedCountryInSidebar
        ? selectedCountryInSidebar.name
        : 'worldwide';

    useEffect(() => {
        setIsLoading(!chartData || !chartData[selectedCountry]);
    }, [chartData, selectedCountry]);

    const cumulativeChartData = useMemo(() => {
        if (
            chartType !== ChartType.Cumulative ||
            !chartData ||
            !chartData[selectedCountry]
        )
            return [];

        return getCumulativeChartData(chartData[selectedCountry]);
    }, [chartType, chartData, selectedCountry]);

    return (
        <>
            {isLoading ? (
                <Loader />
            ) : (
                <ChartContainer>
                    <Typography
                        variant="body1"
                        sx={{ width: '100%', textAlign: 'center' }}
                    >
                        Total confirmed cases:{' '}
                        <strong>
                            {selectedCountry.charAt(0).toUpperCase() +
                                selectedCountry.slice(1)}
                        </strong>
                    </Typography>

                    <ToggleButtonGroup
                        color="primary"
                        value={chartType}
                        exclusive
                        onChange={(_, value) =>
                            dispatch(setChartType(value as ChartType))
                        }
                        aria-label="chart data type change buttons"
                    >
                        <ToggleButton value={ChartType.Bar}>
                            Bar chart
                        </ToggleButton>
                        <ToggleButton value={ChartType.Cumulative}>
                            Cumulative chart
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {chartType === ChartType.Bar ? (
                        <BarChart data={chartData[selectedCountry]} />
                    ) : (
                        <CumulativeChart data={cumulativeChartData} />
                    )}
                </ChartContainer>
            )}
        </>
    );
};

export default ChartView;
