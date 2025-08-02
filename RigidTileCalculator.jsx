
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateTileUpliftMoment } from '@/lib/tile-uplift-calculator';
import { AlertTriangle, Calculator, Wind, HelpCircle, RefreshCw, CheckCircle, XCircle, FileText, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Switch } from "@/components/ui/switch";

const GCp_defaults = { 1: -0.9, 2: -1.3, 3: -2.0 };

const RigidTileCalculator = () => {
  const initialInputs = {
    windSpeed: '175',
    meanHeight: '30',
    exposure: 'C',
    roofZone: '3',
    tileLength: '17',
    tileWidth: '12',
    liftCoefficient: '0.2',
    providedResistance: '27.8',
    gcp: '-2.0',
    kd: '0.85',
  };

  const [inputs, setInputs] = useState(initialInputs);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!showAdvanced) {
      const defaultGcp = GCp_defaults[inputs.roofZone] || '';
      setInputs(prev => ({ ...prev, gcp: String(defaultGcp), kd: '0.85' }));
    }
  }, [inputs.roofZone, showAdvanced]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setResults(null);

    const params = {
      Vult: parseFloat(inputs.windSpeed),
      h: parseFloat(inputs.meanHeight),
      exposure: inputs.exposure,
      roofZone: parseInt(inputs.roofZone, 10),
      tileLengthInches: parseFloat(inputs.tileLength),
      tileWidthInches: parseFloat(inputs.tileWidth),
      liftCoefficientCL: parseFloat(inputs.liftCoefficient),
      providedResistanceMf: inputs.providedResistance ? parseFloat(inputs.providedResistance) : null,
      gcpOverride: showAdvanced ? parseFloat(inputs.gcp) : null,
      kdOverride: showAdvanced ? parseFloat(inputs.kd) : null,
    };

    if (Object.values(params).some((v, i) => v === null && i < 7)) {
      setError('Please fill in all required fields with valid numbers.');
      return;
    }

    try {
      const calculatedResults = calculateTileUpliftMoment(params);
      setResults(calculatedResults);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = () => {
    setInputs(initialInputs);
    setResults(null);
    setError('');
    setShowAdvanced(false);
  };

  const renderResultRow = (label, value, unit, tooltip) => (
    <div className="flex justify-between items-center py-3 px-4 even:bg-gray-50">
      <div className="flex items-center">
        <span className="font-medium text-gray-700">{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 ml-2 text-gray-400 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <span className="font-bold text-lg text-blue-600">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></span>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <Card className="lg:col-span-2 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center"><Calculator className="mr-2" /> Input Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TooltipProvider>
              <div>
                <Label htmlFor="tile-windSpeed">Wind Speed, Vult (mph)</Label>
                <Input id="tile-windSpeed" name="windSpeed" value={inputs.windSpeed} onChange={handleInputChange} type="number" step="any" />
              </div>
              <div>
                <Label htmlFor="tile-meanHeight">Mean Roof Height, h (ft)</Label>
                <Input id="tile-meanHeight" name="meanHeight" value={inputs.meanHeight} onChange={handleInputChange} type="number" step="any" />
              </div>
            </TooltipProvider>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tile-exposure">Exposure Category</Label>
                <Select onValueChange={(value) => handleSelectChange('exposure', value)} value={inputs.exposure}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tile-roofZone">Roof Zone</Label>
                <Select onValueChange={(value) => handleSelectChange('roofZone', value)} value={inputs.roofZone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (Interior)</SelectItem>
                    <SelectItem value="2">2 (Edge)</SelectItem>
                    <SelectItem value="3">3 (Corner)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tile-tileLength">Tile Length (inches)</Label>
                <Input id="tile-tileLength" name="tileLength" value={inputs.tileLength} onChange={handleInputChange} type="number" step="any" />
              </div>
              <div>
                <Label htmlFor="tile-tileWidth">Tile Width (inches)</Label>
                <Input id="tile-tileWidth" name="tileWidth" value={inputs.tileWidth} onChange={handleInputChange} type="number" step="any" />
              </div>
            </div>

            <div>
              <Label htmlFor="tile-liftCoefficient">Lift Coefficient (CL)</Label>
              <Input id="tile-liftCoefficient" name="liftCoefficient" value={inputs.liftCoefficient} onChange={handleInputChange} type="number" step="any" />
            </div>
            
            <div>
              <Label htmlFor="tile-providedResistance">Provided Resistance, Mf (ft-lbf)</Label>
              <Input id="tile-providedResistance" name="providedResistance" value={inputs.providedResistance} onChange={handleInputChange} type="number" step="any" placeholder="e.g., 27.8" />
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Switch id="advanced-options" checked={showAdvanced} onCheckedChange={setShowAdvanced} />
              <Label htmlFor="advanced-options" className="flex items-center cursor-pointer"><Settings2 className="mr-2 h-4 w-4" /> Advanced Options</Label>
            </div>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label htmlFor="tile-gcp">GCp Override</Label>
                      <Input id="tile-gcp" name="gcp" value={inputs.gcp} onChange={handleInputChange} type="number" step="any" />
                    </div>
                    <div>
                      <Label htmlFor="tile-kd">Kd Override</Label>
                      <Input id="tile-kd" name="kd" value={inputs.kd} onChange={handleInputChange} type="number" step="any" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" className="w-full premium-button text-white">
                <Wind className="mr-2 h-4 w-4" /> Calculate
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="lg:col-span-3">
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          {results && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Calculation Results</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {results.result && (
                    <div className={`p-4 text-center text-2xl font-bold text-white ${results.result === 'Pass' ? 'bg-green-600' : 'bg-red-600'}`}>
                      <div className="flex items-center justify-center">
                        {results.result === 'Pass' ? <CheckCircle className="mr-2" /> : <XCircle className="mr-2" />}
                        {results.result}
                      </div>
                    </div>
                  )}
                  <div className="p-4 border-b">
                    <div className="text-center">
                      <p className="text-lg text-gray-600">Aerodynamic Uplift Moment (Ma)</p>
                      <p className="text-5xl font-bold text-blue-600 my-2">{results.Ma.toFixed(2)} <span className="text-2xl font-medium text-gray-500">ft-lbf</span></p>
                    </div>
                  </div>
                  <div className="border-b">
                    <h4 className="font-bold text-lg p-4 bg-gray-100">Calculation Breakdown</h4>
                    {renderResultRow("Velocity Pressure, qh", results.qh.toFixed(2), "psf", "Velocity pressure from ASCE 7-22 Eq. 26.10-1.")}
                    {renderResultRow("Exposure Coefficient, Kz", results.Kz.toFixed(2), "", "Based on height and exposure, per ASCE 7-22 Table 26.10-1.")}
                    {renderResultRow("Roof Pressure Coeff., GCp", results.GCp.toFixed(2), "", "Roof pressure coefficient from ASCE 7-22 Ch. 30.")}
                    {renderResultRow("Directionality Factor, Kd", results.Kd.toFixed(2), "", "Wind directionality factor (default 0.85) per ASCE 7-22.")}
                    {renderResultRow("Lift Coefficient, CL", results.CL.toFixed(2), "", "Lift coefficient per FBC 2023.")}
                    {renderResultRow("Exposed Tile Width, b", results.b.toFixed(2), "ft", "Exposed width of the roof tile.")}
                    {renderResultRow("Tile Length, L", results.L.toFixed(2), "ft", "Length of the roof tile.")}
                    {renderResultRow("Moment Arm, La", results.La.toFixed(2), "ft", "Moment arm from the axis of rotation.")}
                    {results.Mf && renderResultRow("Provided Resistance, Mf", results.Mf.toFixed(2), "ft-lbf", "User-input from NOA.")}
                  </div>
                </CardContent>
                <CardFooter className="p-4 mt-4 flex-col space-y-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/wind-packages/custom-wind-load-certification">
                      <FileText className="mr-2 h-4 w-4" /> Need a Stamped Letter? Order Full Certification
                    </Link>
                  </Button>
                  <Alert variant="default">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Disclaimer</AlertTitle>
                    <AlertDescription>
                      This tool provides estimates based on FBC 2023 Equation 16-18 (1609.6.3 Rigid tile section) and is not a substitute for professional engineering advice. Verify all designs with a licensed engineer.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RigidTileCalculator;
